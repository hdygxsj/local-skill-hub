"""Base installer interface."""
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Dict, Any


class BaseInstaller(ABC):
    """Base class for IDE installers."""

    @abstractmethod
    def get_install_path(self, scope: str, project_path: str = None) -> Path:
        """Get installation path based on scope."""
        pass

    @abstractmethod
    def install_package(self, package_path: Path, install_path: Path) -> List[str]:
        """Install package to target path.
        
        Returns:
            List of installed file paths
        """
        pass

    @abstractmethod
    def uninstall_files(self, files: List[str]) -> bool:
        """Uninstall files.
        
        Returns:
            True if successful
        """
        pass

    @abstractmethod
    def merge_settings(self, install_path: Path, package_path: Path) -> bool:
        """Merge settings.json if needed."""
        pass
