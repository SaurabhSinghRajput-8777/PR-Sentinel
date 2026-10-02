"""
PR Sentinel — GitHub App Client & PR Extraction Module
Handles GitHub App JWT authentication, installation token generation,
and Pull Request metadata/diff extraction.
"""

import os
import time
import requests
import jwt
from typing import Dict, Any, List, Optional


class GitHubAppClient:
    def __init__(self, app_id: Optional[str] = None, private_key: Optional[str] = None):
        self.app_id = app_id or os.environ.get("GITHUB_APP_ID")
        self.private_key = private_key or os.environ.get("GITHUB_PRIVATE_KEY", "").replace("\\n", "\n")
        self.base_url = "https://api.github.com"

    def _generate_jwt(self) -> str:
        """Generate GitHub App JWT with 10-minute expiry."""
        if not self.app_id or not self.private_key:
            raise ValueError("GITHUB_APP_ID and GITHUB_PRIVATE_KEY must be provided")

        now = int(time.time())
        payload = {
            "iat": now - 60,  # 1 minute in the past for clock drift
            "exp": now + (9 * 60),  # 9 minutes in the future (max 10 min allowed)
            "iss": self.app_id,
        }
        return jwt.encode(payload, self.private_key, algorithm="RS256")

    def get_installation_access_token(self, installation_id: int) -> str:
        """Exchange App JWT for an installation access token."""
        app_jwt = self._generate_jwt()
        headers = {
            "Authorization": f"Bearer {app_jwt}",
            "Accept": "application/vnd.github.v3+json",
        }
        url = f"{self.base_url}/app/installations/{installation_id}/access_tokens"
        response = requests.post(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()["token"]


class GitHubPRExtractor:
    def __init__(self, token: str):
        self.token = token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github.v3+json",
        }

    def get_pr_metadata(self, owner: str, repo: str, pr_number: int) -> Dict[str, Any]:
        """Fetch Pull Request details including title, author, base/head commit."""
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}"
        response = requests.get(url, headers=self.headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        return {
            "number": data["number"],
            "title": data["title"],
            "state": data["state"],
            "author": data["user"]["login"],
            "base_branch": data["base"]["ref"],
            "head_branch": data["head"]["ref"],
            "head_sha": data["head"]["sha"],
            "additions": data["additions"],
            "deletions": data["deletions"],
            "changed_files_count": data["changed_files"],
        }

    def get_pr_files(self, owner: str, repo: str, pr_number: int) -> List[Dict[str, Any]]:
        """Fetch list of changed files with pagination."""
        files = []
        page = 1
        per_page = 100

        while True:
            url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}/files?page={page}&per_page={per_page}"
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            batch = response.json()
            if not batch:
                break
            for item in batch:
                files.append({
                    "filename": item["filename"],
                    "status": item["status"],
                    "additions": item["additions"],
                    "deletions": item["deletions"],
                    "changes": item["changes"],
                    "patch": item.get("patch", "")
                })
            if len(batch) < per_page:
                break
            page += 1

        return files

    def get_pr_diff(self, owner: str, repo: str, pr_number: int) -> str:
        """Fetch raw unified diff for the Pull Request."""
        headers = dict(self.headers)
        headers["Accept"] = "application/vnd.github.v3.diff"
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}"
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        return response.text
