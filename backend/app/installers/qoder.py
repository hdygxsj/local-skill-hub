"""Qoder IDE installer."""
import json
import shutil
from pathlib import Path
from typing import List, Optional

from .base import BaseInstaller


class QoderInstaller(BaseInstaller):
    """Installer for Qoder IDE."""

    def get_install_path(self, scope: str, project_path: str = None) -> Path:
        """Get Qoder installation path."""
        if scope == "user":
            return Path.home() / ".qoder"
        elif scope == "project":
            if not project_path:
                raise ValueError("Project path required for project-level install")
            return Path(project_path) / ".qoder"
        else:
            raise ValueError(f"Invalid scope: {scope}")

    def install_package(self, package_path: Path, install_path: Path) -> List[str]:
        """Install package to Qoder."""
        installed_files = []

        # Find source directories (check both .qoder and root)
        qoder_source = package_path / ".qoder"
        if qoder_source.exists():
            source_base = qoder_source
        else:
            source_base = package_path

        # Install skills
        skills_source = source_base / "skills"
        if skills_source.exists():
            skills_target = install_path / "skills"
            skills_target.mkdir(parents=True, exist_ok=True)
            
            for skill_dir in skills_source.iterdir():
                if skill_dir.is_dir():
                    target = skills_target / skill_dir.name
                    if target.exists():
                        shutil.rmtree(target)
                    shutil.copytree(skill_dir, target)
                    installed_files.append(str(target))

        # Install agents
        agents_source = source_base / "agents"
        if agents_source.exists():
            agents_target = install_path / "agents"
            agents_target.mkdir(parents=True, exist_ok=True)
            
            for agent_file in agents_source.glob("*.md"):
                target = agents_target / agent_file.name
                shutil.copy2(agent_file, target)
                installed_files.append(str(target))

        # Install hooks
        hooks_source = source_base / "hooks"
        if hooks_source.exists():
            hooks_target = install_path / "hooks"
            hooks_target.mkdir(parents=True, exist_ok=True)
            
            for hook_file in hooks_source.glob("*.sh"):
                target = hooks_target / hook_file.name
                shutil.copy2(hook_file, target)
                # Make executable
                target.chmod(target.stat().st_mode | 0o111)
                installed_files.append(str(target))

        # Merge settings
        self.merge_settings(install_path, source_base)

        return installed_files

    def uninstall_files(self, files: List[str]) -> bool:
        """Remove installed files."""
        for file_path in files:
            path = Path(file_path)
            if path.exists():
                if path.is_dir():
                    shutil.rmtree(path)
                else:
                    path.unlink()
        return True

    def merge_settings(self, install_path: Path, package_path: Path) -> bool:
        """Merge settings.json with package settings."""
        package_settings = package_path / "settings.json"
        if not package_settings.exists():
            return True

        target_settings = install_path / "settings.json"
        
        # Load existing settings
        existing = {}
        if target_settings.exists():
            with open(target_settings, "r") as f:
                existing = json.load(f)

        # Load package settings
        with open(package_settings, "r") as f:
            package = json.load(f)

        # Merge hooks
        if "hooks" in package:
            if "hooks" not in existing:
                existing["hooks"] = {}
            
            for event, handlers in package["hooks"].items():
                if event not in existing["hooks"]:
                    existing["hooks"][event] = []
                existing["hooks"][event].extend(handlers)

        # Write merged settings
        target_settings.parent.mkdir(parents=True, exist_ok=True)
        with open(target_settings, "w") as f:
            json.dump(existing, f, indent=2)

        return True
