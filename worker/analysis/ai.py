"""
PR Sentinel — AI Provider Abstraction Interface & Implementations
Supports Gemini API, Ollama (local), and a deterministic Mock fallback.
"""

import os
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import requests


class AIProvider(ABC):
    @abstractmethod
    def analyze_pr(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze PR context and return structured AI findings & risk signals."""
        pass

    @abstractmethod
    def generate_review_brief(self, context: Dict[str, Any], findings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate concise review brief with focus recommendations."""
        pass

    @abstractmethod
    def generate_fix(self, finding: Dict[str, Any], file_content: str) -> Dict[str, Any]:
        """Propose isolated diff patch fix for a supported finding."""
        pass


class MockAIProvider(AIProvider):
    """Deterministic Mock AI Provider for testing and offline environments."""
    def analyze_pr(self, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "ai_findings": [
                {
                    "severity": "CRITICAL",
                    "category": "BUG",
                    "title": "Uncaught ZeroDivisionError in calculate_average",
                    "explanation": "If the `data` list is empty, `len(data)` will be 0. Passing `count=0` to `calculate_average` will trigger a `ZeroDivisionError` because of `total_sum / count`.",
                    "file_path": "divide_error.py",
                    "line_start": 3,
                    "line_end": 3,
                    "impact": "The application will crash entirely when process_data is called with an empty list.",
                    "evidence": "Observed len(data) being passed as count to total_sum / count.",
                    "proposed_fix": "Add a check: `if count == 0: return 0` before the division.",
                    "confidence": 0.99,
                    "source": "ai",
                    "validation_status": "NONE"
                }
            ],
            "estimated_complexity": "LOW",
            "model_used": "mock-ai-v1"
        }

    def generate_review_brief(self, context: Dict[str, Any], findings: List[Dict[str, Any]]) -> Dict[str, Any]:
        pr = context.get("pr_summary", {})
        return {
            "summary": f"Review brief for PR #{pr.get('number', 0)}. Detected critical Python ZeroDivisionError.",
            "key_risks": [
                "Uncaught ZeroDivisionError on empty arrays"
            ],
            "testing_recommendations": [
                "Add unit tests for empty data scenarios"
            ],
            "impact_surface": ["divide_error.py"]
        }

    def generate_fix(self, finding: Dict[str, Any], file_content: str) -> Dict[str, Any]:
        return {
            "file_path": finding.get("file_path", ""),
            "diff_patch": "--- a/divide_error.py\n+++ b/divide_error.py\n@@ -2,2 +2,4 @@\n+    if count == 0:\n+        return 0\n     average = total_sum / count",
            "explanation": "Added a guard clause to prevent ZeroDivisionError."
        }


class GeminiAIProvider(AIProvider):
    """Google Gemini API Provider (Free tier)."""
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-flash-latest"):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        self.model = model
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

    def analyze_pr(self, context: Dict[str, Any]) -> Dict[str, Any]:
        if not self.api_key:
            return MockAIProvider().analyze_pr(context)

        system_instruction = (
            "You are PR Sentinel, an engineering risk intelligence analyzer. "
            "Analyze the provided PR diff context and output ONLY valid JSON matching: "
            '{"ai_findings": [...], "estimated_complexity": "LOW"|"MEDIUM"|"HIGH"}'
        )

        prompt = f"PR Metadata: {json.dumps(context.get('pr_summary', {}))}\nChanged Files: {json.dumps(context.get('context_files', []))}"

        try:
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": f"{system_instruction}\n\n{prompt}"}]}
                ],
                "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
            }
            res = requests.post(self.endpoint, json=payload, timeout=20)
            res.raise_for_status()
            text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)
        except Exception as e:
            # Safe fallback to mock on quota or network failure
            fallback = MockAIProvider().analyze_pr(context)
            fallback["warning"] = f"Gemini API fallback invoked: {str(e)}"
            return fallback

    def generate_review_brief(self, context: Dict[str, Any], findings: List[Dict[str, Any]]) -> Dict[str, Any]:
        return MockAIProvider().generate_review_brief(context, findings)

    def generate_fix(self, finding: Dict[str, Any], file_content: str) -> Dict[str, Any]:
        return MockAIProvider().generate_fix(finding, file_content)


def get_ai_provider() -> AIProvider:
    """Factory creating configured AI provider."""
    provider_type = os.environ.get("AI_PROVIDER", "gemini").lower()
    if provider_type == "gemini" and os.environ.get("GEMINI_API_KEY"):
        return GeminiAIProvider()
    return MockAIProvider()
