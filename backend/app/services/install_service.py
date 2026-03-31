"""Installation management service."""
import json
from typing import List, Optional
from pathlib import Path

from sqlalchemy.orm import Session

from ..models import Installation, Group
from ..installers import QoderInstaller, CursorInstaller


class InstallService:
    """Handle installation operations."""

    def __init__(self, db: Session):
        self.db = db
        self.installers = {
            "qoder": QoderInstaller(),
            "cursor": CursorInstaller(),
        }

    def install_group(
        self,
        group_id: int,
        target_ide: str,
        install_scope: str,
        install_path: Optional[str] = None
    ) -> Installation:
        """Install a group to target IDE."""
        group = self.db.query(Group).filter(Group.id == group_id).first()
        if not group:
            raise Exception(f"Group not found: {group_id}")

        if target_ide not in self.installers:
            raise Exception(f"Unsupported IDE: {target_ide}")

        installer = self.installers[target_ide]
        
        # Get install path
        if install_scope == "project" and not install_path:
            raise Exception("Project path required for project-level install")
        
        target_path = installer.get_install_path(install_scope, install_path)
        
        # Install all packages in group
        all_installed_files = []
        installed_version = None

        for package in group.packages:
            package_path = Path(package.local_path)
            files = installer.install_package(package_path, target_path)
            all_installed_files.extend(files)
            installed_version = package.version  # Use last package version

        # Create installation record
        installation = Installation(
            group_id=group_id,
            target_ide=target_ide,
            install_scope=install_scope,
            install_path=str(target_path),
            installed_files_json=json.dumps(all_installed_files),
            installed_version=installed_version
        )
        self.db.add(installation)
        self.db.commit()
        self.db.refresh(installation)
        return installation

    def uninstall(self, installation_id: int) -> bool:
        """Uninstall by installation ID."""
        installation = self.db.query(Installation).filter(
            Installation.id == installation_id
        ).first()
        
        if not installation:
            return False

        # Get installer
        if installation.target_ide not in self.installers:
            raise Exception(f"Unsupported IDE: {installation.target_ide}")

        installer = self.installers[installation.target_ide]
        
        # Uninstall files
        files = json.loads(installation.installed_files_json or "[]")
        installer.uninstall_files(files)

        # Delete record
        self.db.delete(installation)
        self.db.commit()
        return True

    def list_installations(self) -> List[Installation]:
        """List all installations."""
        return self.db.query(Installation).all()

    def get_installation(self, installation_id: int) -> Optional[Installation]:
        """Get installation by ID."""
        return self.db.query(Installation).filter(
            Installation.id == installation_id
        ).first()

    def switch_group(
        self,
        old_installation_id: int,
        new_group_id: int,
        target_ide: str,
        install_scope: str,
        install_path: Optional[str] = None
    ) -> Installation:
        """Switch from one group to another."""
        # Uninstall old
        self.uninstall(old_installation_id)
        
        # Install new
        return self.install_group(new_group_id, target_ide, install_scope, install_path)

    def compare_versions(self, installation_id: int) -> dict:
        """Compare installed version with local version."""
        installation = self.get_installation(installation_id)
        if not installation:
            return {}

        group = installation.group
        if not group:
            return {}

        result = {
            "installation_id": installation_id,
            "installed_version": installation.installed_version,
            "packages": []
        }

        for package in group.packages:
            result["packages"].append({
                "name": package.name,
                "installed_version": installation.installed_version,
                "local_version": package.version,
                "needs_upgrade": installation.installed_version != package.version
            })

        return result
