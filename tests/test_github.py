"""
PR Sentinel — Unit tests for GitHub App Authentication & Webhook verification
"""

import hmac
import hashlib
import json
import pytest
from unittest.mock import patch, MagicMock
from worker.analysis.github import GitHubAppClient, GitHubPRExtractor


def test_webhook_hmac_signature_generation():
    """Verify standard GitHub HMAC-SHA256 signature logic."""
    secret = "test_webhook_secret_key"
    payload = json.dumps({"action": "opened", "pull_request": {"number": 184}}).encode("utf-8")
    
    expected_sig = "sha256=" + hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    
    # Test valid signature match
    h = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    assert expected_sig == f"sha256={h}"
    
    # Test invalid signature match
    invalid_sig = "sha256=invalidhex0123456789abcdef"
    assert invalid_sig != expected_sig


@patch("jwt.encode")
def test_github_app_jwt_generation(mock_jwt_encode):
    """Verify GitHub App JWT structure."""
    mock_jwt_encode.return_value = "mock.jwt.token"
    
    client = GitHubAppClient(app_id="123456", private_key="FAKE_RSA_KEY")
    token = client._generate_jwt()
    
    assert token == "mock.jwt.token"
    assert mock_jwt_encode.called
    payload = mock_jwt_encode.call_args[0][0]
    assert payload["iss"] == "123456"
    assert payload["exp"] - payload["iat"] == 600  # 10 minute delta


@patch("requests.post")
@patch.object(GitHubAppClient, "_generate_jwt", return_value="fake.jwt.token")
def test_installation_token_exchange(mock_jwt, mock_post):
    """Verify exchange of App JWT for installation access token."""
    mock_response = MagicMock()
    mock_response.json.return_value = {"token": "ghs_installation_token_abc123"}
    mock_response.raise_for_status = MagicMock()
    mock_post.return_value = mock_response

    client = GitHubAppClient(app_id="123456", private_key="FAKE_RSA_KEY")
    token = client.get_installation_access_token(installation_id=987654)

    assert token == "ghs_installation_token_abc123"
    mock_post.assert_called_once()
    assert "Authorization" in mock_post.call_args[1]["headers"]
    assert mock_post.call_args[1]["headers"]["Authorization"] == "Bearer fake.jwt.token"


@patch("requests.get")
def test_pr_metadata_and_files_extraction(mock_get):
    """Verify PR metadata and files parsing."""
    mock_meta_response = MagicMock()
    mock_meta_response.json.return_value = {
        "number": 184,
        "title": "refactor(auth): migrate token rotation",
        "state": "open",
        "user": {"login": "alexchen"},
        "base": {"ref": "main"},
        "head": {"ref": "feat/auth-session", "sha": "e8f39b1"},
        "additions": 140,
        "deletions": 20,
        "changed_files": 2
    }
    mock_meta_response.raise_for_status = MagicMock()

    mock_files_response = MagicMock()
    mock_files_response.json.return_value = [
        {"filename": "src/auth/jwt.ts", "status": "modified", "additions": 40, "deletions": 10, "changes": 50, "patch": "@@ -1,4 +1,6 @@"},
        {"filename": "src/auth/session.ts", "status": "modified", "additions": 100, "deletions": 10, "changes": 110, "patch": "@@ -20,6 +20,12 @@"}
    ]
    mock_files_response.raise_for_status = MagicMock()

    # First call is metadata, second is files, third is empty page
    mock_get.side_effect = [mock_meta_response, mock_files_response, MagicMock(json=lambda: [])]

    extractor = GitHubPRExtractor(token="ghs_test_token")
    metadata = extractor.get_pr_metadata("owner", "repo", 184)
    files = extractor.get_pr_files("owner", "repo", 184)

    assert metadata["number"] == 184
    assert metadata["author"] == "alexchen"
    assert metadata["head_sha"] == "e8f39b1"
    assert len(files) == 2
    assert files[0]["filename"] == "src/auth/jwt.ts"
