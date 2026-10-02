"""
PR Sentinel — Deterministic Risk Engine & Multi-Dimensional Scoring
Calculates a repeatable, deterministic risk score (0-100) and risk level
across 5 dimensions: Security, Bug probability, Regression blast radius,
Complexity, and Test coverage delta.
"""

from typing import List, Dict, Any, Tuple


class RiskEngine:
    # Dimension weights summing to 1.0
    WEIGHT_SECURITY = 0.35
    WEIGHT_BUG = 0.25
    WEIGHT_REGRESSION = 0.20
    WEIGHT_COMPLEXITY = 0.10
    WEIGHT_TEST = 0.10

    @classmethod
    def calculate_risk(
        cls,
        findings: List[Dict[str, Any]],
        additions: int,
        deletions: int,
        changed_files_count: int,
        has_tests: bool = True
    ) -> Tuple[int, str, Dict[str, float]]:
        """
        Calculates deterministic risk score between 0 and 100.
        Returns: (score, level, breakdown_dict)
        """
        # 1. Security Score (0-100)
        sec_findings = [f for f in findings if f.get("category") == "SECURITY"]
        sec_score = 0
        for f in sec_findings:
            sev = f.get("severity", "LOW")
            if sev == "CRITICAL":
                sec_score += 50
            elif sev == "HIGH":
                sec_score += 30
            elif sev == "MEDIUM":
                sec_score += 15
            else:
                sec_score += 5
        sec_score = min(100, sec_score)

        # 2. Bug Score (0-100)
        bug_findings = [f for f in findings if f.get("category") == "BUG"]
        bug_score = 0
        for f in bug_findings:
            sev = f.get("severity", "LOW")
            if sev == "CRITICAL":
                bug_score += 45
            elif sev == "HIGH":
                bug_score += 25
            elif sev == "MEDIUM":
                bug_score += 10
            else:
                bug_score += 5
        bug_score = min(100, bug_score)

        # 3. Regression / Blast Radius Score (0-100)
        reg_findings = [f for f in findings if f.get("category") == "REGRESSION"]
        reg_score = min(100, len(reg_findings) * 30 + changed_files_count * 4)

        # 4. Complexity Score (0-100 based on churn)
        total_churn = additions + deletions
        if total_churn > 800 or changed_files_count > 25:
            complexity_score = 90
        elif total_churn > 400 or changed_files_count > 15:
            complexity_score = 65
        elif total_churn > 150:
            complexity_score = 40
        else:
            complexity_score = 15

        # 5. Test Delta Score (0-100: high score = lack of tests)
        test_score = 10 if has_tests else 75

        # Composite Weighted Calculation
        final_score = int(round(
            (sec_score * cls.WEIGHT_SECURITY) +
            (bug_score * cls.WEIGHT_BUG) +
            (reg_score * cls.WEIGHT_REGRESSION) +
            (complexity_score * cls.WEIGHT_COMPLEXITY) +
            (test_score * cls.WEIGHT_TEST)
        ))

        # Clamp between 0 and 100
        final_score = max(0, min(100, final_score))

        # Categorize level
        if final_score >= 80 or sec_score >= 80:
            level = "CRITICAL"
        elif final_score >= 60:
            level = "HIGH"
        elif final_score >= 35:
            level = "MEDIUM"
        else:
            level = "LOW"

        breakdown = {
            "security": float(sec_score),
            "bug": float(bug_score),
            "regression": float(reg_score),
            "complexity": float(complexity_score),
            "test": float(test_score),
        }

        return final_score, level, breakdown
