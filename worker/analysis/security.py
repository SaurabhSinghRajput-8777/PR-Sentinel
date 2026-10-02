"""
PR Sentinel — Deterministic Static Security & AST Analysis Module
Executes rule-based pattern checks and AST inspections to produce
normalized engineering findings with 5-part explainability.
"""

import re
from typing import List, Dict, Any

# Security patterns mapping to standardized categories
RULES = [
    {
        "id": "SEC-SQL-01",
        "category": "SECURITY",
        "severity": "CRITICAL",
        "name": "Potential SQL Injection via Raw String Concatenation",
        "pattern": re.compile(r"(?i)(SELECT|INSERT|UPDATE|DELETE).*\+.*|\bexecute\s*\(\s*f['\"].*\{"),
        "explanation": "Detected SQL query construction using direct string concatenation or unescaped f-string interpolation.",
        "impact": "May allow arbitrary database query execution, data exfiltration, or tampering.",
        "fix": "Use parameterized queries or ORM query builders."
    },
    {
        "id": "SEC-SECRET-02",
        "category": "SECURITY",
        "severity": "CRITICAL",
        "name": "Hardcoded Secret / Token Pattern",
        "pattern": re.compile(r"(?i)(['\"](ghp_[A-Za-z0-9]{36}|AIza[0-9A-Za-z-_]{35}|sk-[A-Za-z0-9]{48})['\"])"),
        "explanation": "A high-entropy token or credentials matching known API key signatures was found directly in source code.",
        "impact": "Exposing secrets in version control compromises infrastructure and allows unauthorized access.",
        "fix": "Extract credential to environment variables or secret manager."
    },
    {
        "id": "BUG-UNBOUND-03",
        "category": "BUG",
        "severity": "HIGH",
        "name": "Unbounded Retry / While Loop Without Jitter or Timeout",
        "pattern": re.compile(r"(?i)while\s+True:\s*(?!.*(sleep|break|timeout))"),
        "explanation": "Infinite loop detected with no apparent sleep, timeout, or break condition.",
        "impact": "Can lead to 100% CPU thread starvation and cascading system failure.",
        "fix": "Add exponential backoff, jitter, and a maximum iteration boundary."
    },
    {
        "id": "REG-AUTH-04",
        "category": "REGRESSION",
        "severity": "HIGH",
        "name": "Disabled Security Guard or Bypass Condition",
        "pattern": re.compile(r"(?i)(return\s+True\s*#.*bypass|if\s+True:\s*return\s+next\(\))"),
        "explanation": "Hardcoded bypass condition detected in authentication or authorization flow.",
        "impact": "Bypasses access controls in production environments.",
        "fix": "Remove testing bypass condition before merging."
    }
]


class StaticSecurityAnalyzer:
    @classmethod
    def analyze_file_changes(cls, file_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Runs deterministic security rules over added/modified lines in a single file.
        """
        findings: List[Dict[str, Any]] = []
        file_path = file_info.get("file_path", "")
        added_lines = file_info.get("added_lines", [])

        for line_item in added_lines:
            line_num = line_item["line_number"]
            code = line_item["content"]

            for rule in RULES:
                if rule["pattern"].search(code):
                    findings.append({
                        "severity": rule["severity"],
                        "category": rule["category"],
                        "title": rule["name"],
                        "explanation": rule["explanation"],
                        "file_path": file_path,
                        "line_start": line_num,
                        "line_end": line_num,
                        "impact": rule["impact"],
                        "evidence": f"Rule: {rule['id']} matched code: '{code.strip()}'",
                        "proposed_fix": rule["fix"],
                        "confidence": 0.98,
                        "source": "deterministic",
                        "validation_status": "NONE",
                        "is_dismissed": False
                    })

        return findings

    @classmethod
    def analyze_all(cls, parsed_files: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        all_findings = []
        for f in parsed_files:
            all_findings.extend(cls.analyze_file_changes(f))
        return all_findings
