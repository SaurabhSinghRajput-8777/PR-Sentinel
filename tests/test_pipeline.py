"""
PR Sentinel — Comprehensive Test Suite covering Phases 4 through 10
Tests:
- DiffParser (Phase 4)
- ContextBuilder (Phase 4)
- StaticSecurityAnalyzer (Phase 5)
- AIProvider Abstraction (Phase 6)
- RiskEngine (Phase 7)
- ReviewerRecommendationEngine (Phase 8)
"""

import pytest
from worker.analysis.diff import DiffParser
from worker.analysis.context import ContextBuilder
from worker.analysis.security import StaticSecurityAnalyzer
from worker.analysis.ai import MockAIProvider, get_ai_provider
from worker.analysis.risk import RiskEngine
from worker.analysis.reviewer import ReviewerRecommendationEngine


def test_diff_parser_hunks_and_lines():
    sample_patch = """@@ -1,4 +1,6 @@
 import os
+import sys
+import time
 def run():
-    pass
+    return True
"""
    result = DiffParser.parse_patch("src/auth/jwt.ts", sample_patch)
    assert result["language"] == "typescript"
    assert len(result["hunks"]) == 1
    assert result["additions_count"] == 3
    assert result["deletions_count"] == 1
    assert any("import sys" in line["content"] for line in result["added_lines"])


def test_context_builder_sanitization_and_bounding():
    pr_meta = {"number": 184, "title": "test pr", "author": "dev", "head_sha": "abc"}
    files = [{
        "file_path": "src/config.py",
        "language": "python",
        "added_lines": [
            {"line_number": 1, "content": 'api_key = "AIzaSyD-1234567890123456789012345678"'},
            {"line_number": 2, "content": 'normal_code = 123'}
        ],
        "removed_lines": []
    }]
    ctx = ContextBuilder.build_analysis_context(pr_meta, files)
    assert ctx["is_untrusted_data"] is True
    added_code = ctx["context_files"][0]["added_lines"][0]["code"]
    assert "[REDACTED_SECRET]" in added_code


def test_static_security_analyzer_detections():
    files = [{
        "file_path": "src/db.py",
        "added_lines": [
            {"line_number": 12, "content": 'query = "SELECT * FROM users WHERE id = " + user_id'},
            {"line_number": 15, "content": 'token = "ghp_123456789012345678901234567890123456"'}
        ]
    }]
    findings = StaticSecurityAnalyzer.analyze_all(files)
    assert len(findings) == 2
    categories = [f["category"] for f in findings]
    assert "SECURITY" in categories
    assert any("SQL Injection" in f["title"] for f in findings)


def test_ai_provider_and_brief_generation():
    provider = MockAIProvider()
    ctx = {"context_files": [{"file_path": "auth.ts"}]}
    analysis = provider.analyze_pr(ctx)
    brief = provider.generate_review_brief(ctx, analysis["ai_findings"])
    fix = provider.generate_fix(analysis["ai_findings"][0], "original code")

    assert len(analysis["ai_findings"]) > 0
    assert "diff_patch" in fix
    assert "key_risks" in brief


def test_deterministic_risk_engine():
    # Test critical security finding pushes score up
    findings = [{
        "category": "SECURITY",
        "severity": "CRITICAL",
        "title": "SQL Injection"
    }]
    score, level, breakdown = RiskEngine.calculate_risk(
        findings=findings,
        additions=400,
        deletions=100,
        changed_files_count=10,
        has_tests=True
    )
    assert score >= 30
    assert breakdown["security"] == 50.0

    # Test clean low-risk PR
    clean_score, clean_level, _ = RiskEngine.calculate_risk(
        findings=[],
        additions=10,
        deletions=5,
        changed_files_count=1,
        has_tests=True
    )
    assert clean_score < 30
    assert clean_level == "LOW"


def test_reviewer_recommendation_engine():
    changed_files = ["src/auth/jwt.ts", "src/auth/session.ts"]
    signals = [
        {"developer_login": "author_dev", "file_path": "src/auth/jwt.ts", "commit_count": 20},
        {"developer_login": "marcus", "file_path": "src/auth/jwt.ts", "commit_count": 15},
        {"developer_login": "marcus", "file_path": "src/auth/session.ts", "commit_count": 10},
        {"developer_login": "priya", "file_path": "src/auth/jwt.ts", "commit_count": 5},
    ]

    recommendations = ReviewerRecommendationEngine.recommend_reviewers(
        changed_files=changed_files,
        developer_signals=signals,
        pr_author="author_dev"
    )

    assert len(recommendations) == 2
    # Marcus has higher coverage & commits than Priya, author is excluded
    assert recommendations[0]["recommended_login"] == "marcus"
    assert recommendations[0]["score"] > recommendations[1]["score"]
