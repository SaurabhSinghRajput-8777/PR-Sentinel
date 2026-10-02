"""
PR Sentinel — Diff Parser & Extractor
Parses unified diffs into structured file changes, added/removed lines,
and surrounding code context chunks.
"""

import re
from typing import List, Dict, Any, Optional

HUNK_HEADER_RE = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)")

LANGUAGE_EXTENSIONS = {
    ".py": "python",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".js": "javascript",
    ".jsx": "javascript",
    ".java": "java",
    ".go": "go",
    ".cpp": "cpp",
    ".c": "c",
    ".rs": "rust",
    ".sql": "sql",
}


class DiffParser:
    @staticmethod
    def detect_language(file_path: str) -> str:
        for ext, lang in LANGUAGE_EXTENSIONS.items():
            if file_path.endswith(ext):
                return lang
        return "text"

    @classmethod
    def parse_patch(cls, file_path: str, patch: str) -> Dict[str, Any]:
        """
        Parses a single file unified git patch into structured hunks and line ranges.
        """
        language = cls.detect_language(file_path)
        added_lines: List[Dict[str, Any]] = []
        removed_lines: List[Dict[str, Any]] = []
        hunks: List[Dict[str, Any]] = []

        if not patch:
            return {
                "file_path": file_path,
                "language": language,
                "hunks": [],
                "added_lines": [],
                "removed_lines": [],
                "additions_count": 0,
                "deletions_count": 0
            }

        lines = patch.split("\n")
        current_hunk = None
        current_new_line = 0
        current_old_line = 0

        for line in lines:
            m = HUNK_HEADER_RE.match(line)
            if m:
                if current_hunk:
                    hunks.append(current_hunk)
                old_start = int(m.group(1))
                new_start = int(m.group(3))
                header_context = m.group(5).strip()
                current_hunk = {
                    "header": line,
                    "old_start": old_start,
                    "new_start": new_start,
                    "context_hint": header_context,
                    "lines": []
                }
                current_old_line = old_start
                current_new_line = new_start
            elif current_hunk is not None:
                current_hunk["lines"].append(line)
                if line.startswith("+"):
                    added_lines.append({
                        "line_number": current_new_line,
                        "content": line[1:]
                    })
                    current_new_line += 1
                elif line.startswith("-"):
                    removed_lines.append({
                        "line_number": current_old_line,
                        "content": line[1:]
                    })
                    current_old_line += 1
                else:
                    current_old_line += 1
                    current_new_line += 1

        if current_hunk:
            hunks.append(current_hunk)

        return {
            "file_path": file_path,
            "language": language,
            "hunks": hunks,
            "added_lines": added_lines,
            "removed_lines": removed_lines,
            "additions_count": len(added_lines),
            "deletions_count": len(removed_lines)
        }
