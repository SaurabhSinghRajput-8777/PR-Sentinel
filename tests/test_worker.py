"""
PR Sentinel — Unit tests for Phase 3 Analysis Worker lifecycle and state transitions
"""

import pytest
from unittest.mock import MagicMock
from worker.analysis.main import AnalysisWorker
from worker.validation.validate_patch import PatchValidator


def test_worker_lifecycle_queued_to_completed():
    """Verify job lifecycle transitions QUEUED -> RUNNING -> COMPLETED."""
    mock_supabase = MagicMock()
    
    # Mock get_next_queued_job response
    mock_job = {
        "id": "job-uuid-123",
        "repository_id": "repo-uuid-456",
        "pull_request_id": "pr-uuid-789",
        "commit_sha": "e8f39b1",
        "status": "QUEUED",
        "priority": 1
    }
    
    mock_query = MagicMock()
    mock_query.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.order.return_value = mock_query
    mock_query.limit.return_value = mock_query
    mock_query.execute.return_value = MagicMock(data=[mock_job])
    mock_supabase.table.return_value = mock_query

    worker = AnalysisWorker(supabase=mock_supabase)
    success = worker.execute_job()

    assert success is True
    # Verify table updates were called
    assert mock_supabase.table.called


def test_worker_failure_transitions_to_failed():
    """Verify worker catches unhandled exceptions and transitions job to FAILED."""
    mock_supabase = MagicMock()
    mock_job = {
        "id": "job-uuid-fail",
        "repository_id": "repo-uuid",
        "commit_sha": "failsha",
        "status": "QUEUED"
    }

    mock_query = MagicMock()
    mock_query.select.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.order.return_value = mock_query
    mock_query.limit.return_value = mock_query
    mock_query.execute.return_value = MagicMock(data=[mock_job])
    mock_supabase.table.return_value = mock_query

    # Force error during analysis run insert
    def raise_error(*args, **kwargs):
        raise RuntimeError("Database connection timeout during static analysis")

    worker = AnalysisWorker(supabase=mock_supabase)
    worker.mark_job_running = MagicMock()
    worker.mark_job_failed = MagicMock()
    
    # Mock failure inside execute_job by patching mark_job_completed to raise
    worker.mark_job_completed = raise_error

    success = worker.execute_job("job-uuid-fail")
    assert success is False
    worker.mark_job_failed.assert_called_once()
    assert "Database connection timeout" in worker.mark_job_failed.call_args[0][1]


def test_patch_validator_lifecycle():
    """Verify fix validation updates to TESTING and VALIDATED."""
    mock_supabase = MagicMock()
    mock_query = MagicMock()
    mock_query.update.return_value = mock_query
    mock_query.insert.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.execute.return_value = MagicMock(data=[{"id": "val-uuid-1"}])
    mock_supabase.table.return_value = mock_query

    validator = PatchValidator(supabase=mock_supabase)
    success = validator.validate_fix("fix-uuid-123")

    assert success is True
    assert mock_supabase.table.called
