"""
PR Sentinel — Developer Expertise & Reviewer Recommendation Engine
Matches Pull Request changed files against observable git history and file ownership signals.
"""

from typing import List, Dict, Any


class ReviewerRecommendationEngine:
    @classmethod
    def recommend_reviewers(
        cls,
        changed_files: List[str],
        developer_signals: List[Dict[str, Any]],
        pr_author: str,
        max_recommendations: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Calculates recommendation score based on observable commit recency & count.
        Excludes the PR author.
        """
        candidate_scores: Dict[str, Dict[str, Any]] = {}

        for sig in developer_signals:
            login = sig.get("developer_login", "")
            file_path = sig.get("file_path", "")
            commit_count = sig.get("commit_count", 0)

            # Exclude PR author from self-review
            if login == pr_author:
                continue

            if file_path in changed_files:
                if login not in candidate_scores:
                    candidate_scores[login] = {
                        "login": login,
                        "score": 0.0,
                        "matched_files": set(),
                        "commit_hits": 0,
                    }
                candidate_scores[login]["matched_files"].add(file_path)
                candidate_scores[login]["commit_hits"] += commit_count

        # Score candidates
        results = []
        for login, data in candidate_scores.items():
            coverage_pct = len(data["matched_files"]) / max(1, len(changed_files))
            normalized_commits = min(1.0, data["commit_hits"] / 20.0)
            score = round((coverage_pct * 60.0) + (normalized_commits * 40.0), 1)

            match_reasons = [
                f"Contributed {data['commit_hits']} commits across {len(data['matched_files'])} changed files",
                f"Touches {int(coverage_pct * 100)}% of PR surface area"
            ]

            results.append({
                "recommended_login": login,
                "score": score,
                "match_reasons": match_reasons,
                "is_assigned": False
            })

        # Sort descending by score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:max_recommendations]
