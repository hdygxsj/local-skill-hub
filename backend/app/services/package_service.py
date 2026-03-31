"""Package management service."""
import json
import shutil
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from sqlalchemy.orm import Session

from ..models import Source, Package
from ..database import DATA_DIR
from .git_service import GitService


PACKAGES_DIR = DATA_DIR / "packages"
PACKAGES_DIR.mkdir(exist_ok=True)


class PackageService:
    """Handle package operations."""

    def __init__(self, db: Session):
        self.db = db
        self.git = GitService()

    def import_from_git(self, url: str, name: Optional[str] = None) -> Package:
        """Import package from Git URL."""
        # Extract name from URL if not provided
        if not name:
            name = url.rstrip("/").split("/")[-1].replace(".git", "")

        # Create target directory
        target_dir = PACKAGES_DIR / name
        if target_dir.exists():
            # Update existing
            success, msg = self.git.pull(target_dir)
            if not success:
                raise Exception(f"Failed to update package: {msg}")
        else:
            # Clone new
            success, msg = self.git.clone(url, target_dir)
            if not success:
                raise Exception(f"Failed to clone: {msg}")

        # Get version (commit hash)
        version = self.git.get_current_commit(target_dir)

        # Create or update source
        source = self.db.query(Source).filter(
            Source.type == "git",
            Source.url_or_path == url
        ).first()
        
        if not source:
            source = Source(type="git", url_or_path=url)
            self.db.add(source)
            self.db.flush()

        # Create or update package
        package = self.db.query(Package).filter(Package.name == name).first()
        
        if package:
            package.version = version
            package.updated_at = datetime.utcnow()
        else:
            package = Package(
                source_id=source.id,
                name=name,
                version=version,
                local_path=str(target_dir),
                metadata_json=self._extract_metadata(target_dir)
            )
            self.db.add(package)

        self.db.commit()
        self.db.refresh(package)
        return package

    def import_from_local(self, path: str, name: Optional[str] = None) -> Package:
        """Import package from local path."""
        source_path = Path(path)
        if not source_path.exists():
            raise Exception(f"Path does not exist: {path}")

        if not name:
            name = source_path.name

        target_dir = PACKAGES_DIR / name
        
        # Copy to packages directory
        if target_dir.exists():
            shutil.rmtree(target_dir)
        shutil.copytree(source_path, target_dir)

        # Create source
        source = Source(type="local", url_or_path=path)
        self.db.add(source)
        self.db.flush()

        # Create package
        package = Package(
            source_id=source.id,
            name=name,
            version=datetime.utcnow().strftime("%Y%m%d%H%M%S"),
            local_path=str(target_dir),
            metadata_json=self._extract_metadata(target_dir)
        )
        self.db.add(package)
        self.db.commit()
        self.db.refresh(package)
        return package

    def list_packages(self) -> List[Package]:
        """List all packages."""
        return self.db.query(Package).all()

    def get_package(self, package_id: int) -> Optional[Package]:
        """Get package by ID."""
        return self.db.query(Package).filter(Package.id == package_id).first()

    def delete_package(self, package_id: int) -> bool:
        """Delete package."""
        package = self.get_package(package_id)
        if not package:
            return False

        # Delete local files
        local_path = Path(package.local_path)
        if local_path.exists():
            shutil.rmtree(local_path)

        self.db.delete(package)
        self.db.commit()
        return True

    def _extract_metadata(self, path: Path) -> Optional[str]:
        """Extract package metadata."""
        metadata = {
            "skills": [],
            "agents": [],
            "hooks": []
        }

        # Check for .qoder directory
        qoder_dir = path / ".qoder"
        if qoder_dir.exists():
            skills_dir = qoder_dir / "skills"
            if skills_dir.exists():
                metadata["skills"] = [d.name for d in skills_dir.iterdir() if d.is_dir()]
            
            agents_dir = qoder_dir / "agents"
            if agents_dir.exists():
                metadata["agents"] = [f.stem for f in agents_dir.glob("*.md")]
            
            hooks_dir = qoder_dir / "hooks"
            if hooks_dir.exists():
                metadata["hooks"] = [f.name for f in hooks_dir.glob("*.sh")]

        # Also check root skills directory
        skills_dir = path / "skills"
        if skills_dir.exists():
            metadata["skills"] = [d.name for d in skills_dir.iterdir() if d.is_dir()]

        return json.dumps(metadata)
