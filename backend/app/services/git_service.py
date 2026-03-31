"""Git operations service."""
import subprocess
import os
from pathlib import Path
from typing import Optional, Tuple


class GitService:
    """Handle Git operations."""

    @staticmethod
    def clone(url: str, target_dir: Path) -> Tuple[bool, str]:
        """Clone a git repository.
        
        Returns:
            Tuple of (success, message/error)
        """
        try:
            target_dir.parent.mkdir(parents=True, exist_ok=True)
            result = subprocess.run(
                ["git", "clone", url, str(target_dir)],
                capture_output=True,
                text=True,
                timeout=120
            )
            if result.returncode == 0:
                return True, "Clone successful"
            return False, result.stderr
        except subprocess.TimeoutExpired:
            return False, "Clone timeout"
        except Exception as e:
            return False, str(e)

    @staticmethod
    def pull(repo_dir: Path) -> Tuple[bool, str]:
        """Pull latest changes.
        
        Returns:
            Tuple of (success, message/error)
        """
        try:
            result = subprocess.run(
                ["git", "pull"],
                cwd=str(repo_dir),
                capture_output=True,
                text=True,
                timeout=60
            )
            if result.returncode == 0:
                return True, result.stdout
            return False, result.stderr
        except Exception as e:
            return False, str(e)

    @staticmethod
    def get_current_commit(repo_dir: Path) -> Optional[str]:
        """Get current commit hash."""
        try:
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=str(repo_dir),
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                return result.stdout.strip()[:8]
            return None
        except Exception:
            return None

    @staticmethod
    def is_git_repo(path: Path) -> bool:
        """Check if path is a git repository."""
        return (path / ".git").exists()
