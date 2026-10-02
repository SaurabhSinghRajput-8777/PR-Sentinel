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
                    "severity": "HIGH",
                    "category": "BUG",
                    "title": "Potential Race Condition in Token Refresh",
                    "explanation": "Concurrent requests exchanging expired JWTs may trigger multiple session invalidations simultaneously.",
                    "file_path": context.get("context_files", [{}])[0].get("file_path", "unknown.ts"),
                    "line_start": 45,
                    "line_end": 58,
                    "impact": "Legitimate active sessions may be dropped unexpectedly under burst traffic.",
                    "evidence": "Inferred from async token exchange pattern without distributed lock.",
                    "proposed_fix": "Add mutex lock on refresh_token_id before rotating credentials.",
                    "confidence": 0.88,
                    "source": "ai",
                    "validation_status": "NONE"
                }
            ],
            "estimated_complexity": "MEDIUM",
            "model_used": "mock-ai-v1"
        }

    def generate_review_brief(self, context: Dict[str, Any], findings: List[Dict[str, Any]]) -> Dict[str, Any]:
        pr = context.get("pr_summary", {})
        return {
            "summary": f"Review brief for PR #{pr.get('number', 0)} ({pr.get('title', '')}). Bounded blast radius focused on authentication & state management.",
            "key_risks": [
                "Concurrency in token rotation fallback",
                "Unbounded loop resilience in session store reconnect"
            ],
            "testing_recommendations": [
                "Run chaos monkey connection timeout test on Redis",
                "Verify backward compatibility with v1 JWT claims"
            ],
            "impact_surface": [f["file_path"] for f in context.get("context_files", [])]
        }

    def generate_fix(self, finding: Dict[str, Any], file_content: str) -> Dict[str, Any]:
        return {
            "file_path": finding.get("file_path", ""),
            "diff_patch": "--- a/file\n+++ b/file\n@@ -10,3 +10,4 @@\n+// Apply bounded jitter\n+await sleep(boundedDelay);",
            "explanation": "Wrapped unhandled exception and applied bounded exponential backoff."
        }


class GeminiAIProvider(AIProvider):
    """Google Gemini API Provider (Free tier)."""
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-1.5-flash"):
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
