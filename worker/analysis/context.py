"""
PR Sentinel — Bounded Context Builder
Constructs high-signal, bounded context for analysis engines.
Excludes potential secrets, enforces max token limits, and isolates
untrusted repository code from system prompts.
"""

import re
from typing import List, Dict, Any, Optional

# Secret redaction heuristics
SECRET_PATTERNS = [
    (re.compile(r"(?i)(api[_-]?key|secret|token|password|auth|bearer)\s*[:=]\s*['\"][A-Za-z0-9_\-\.]{8,}['\"]"), r"\1: [REDACTED_SECRET]"),
    (re.compile(r"ghp_[A-Za-z0-9]{36}"), "[REDACTED_SECRET]"),
    (re.compile(r"sk-[A-Za-z0-9]{48}"), "[REDACTED_SECRET]"),
    (re.compile(r"AIza[0-9A-Za-z-_]{35}"), "[REDACTED_SECRET]"),
]

MAX_DIFF_LINES_PER_FILE = 200
MAX_TOTAL_CONTEXT_CHARS = 100000  # Roughly 25k tokens


class ContextBuilder:
    @staticmethod
    def sanitize_secrets(code: str) -> str:
        """Mask potential secrets and keys before feeding to external LLMs."""
        sanitized = code
        for pattern, replacement in SECRET_PATTERNS:
            sanitized = pattern.sub(replacement, sanitized)
        return sanitized

    @classmethod
    def build_analysis_context(
        cls, 
        pr_metadata: Dict[str, Any], 
        parsed_files: List[Dict[str, Any]],
        max_chars: int = MAX_TOTAL_CONTEXT_CHARS
    ) -> Dict[str, Any]:
        """
        Builds bounded, sanitized context payload for deterministic & AI engines.
        """
        context_files: List[Dict[str, Any]] = []
        accumulated_chars = 0

        for file_info in parsed_files:
            file_path = file_info.get("file_path", "")
            language = file_info.get("language", "text")
            added_lines = file_info.get("added_lines", [])
            removed_lines = file_info.get("removed_lines", [])

            # Skip common non-code files
            if any(file_path.endswith(ext) for ext in [".png", ".jpg", ".lock", ".svg", ".min.js"]):
                continue

            # Bound line changes per file
            truncated_added = added_lines[:MAX_DIFF_LINES_PER_FILE]
            truncated_removed = removed_lines[:MAX_DIFF_LINES_PER_FILE]

            file_payload = {
                "file_path": file_path,
                "language": language,
                "added_lines": [
                    {"line": l["line_number"], "code": cls.sanitize_secrets(l["content"])}
                    for l in truncated_added
                ],
                "removed_lines": [
                    {"line": l["line_number"], "code": cls.sanitize_secrets(l["content"])}
                    for l in truncated_removed
                ],
                "is_truncated": len(added_lines) > MAX_DIFF_LINES_PER_FILE
            }

            payload_size = len(str(file_payload))
            if accumulated_chars + payload_size > max_chars:
                break

            accumulated_chars += payload_size
            context_files.append(file_payload)

        return {
            "pr_summary": {
                "number": pr_metadata.get("number"),
                "title": pr_metadata.get("title"),
                "author": pr_metadata.get("author"),
                "head_sha": pr_metadata.get("head_sha"),
                "base_branch": pr_metadata.get("base_branch"),
                "head_branch": pr_metadata.get("head_branch"),
            },
            "changed_files_count": len(parsed_files),
            "files_in_context": len(context_files),
            "context_files": context_files,
            "is_untrusted_data": True,
        }
