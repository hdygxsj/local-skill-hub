"""Group management service."""
from typing import List, Optional

from sqlalchemy.orm import Session

from ..models import Group, Package, GroupPackage


class GroupService:
    """Handle group operations."""

    def __init__(self, db: Session):
        self.db = db

    def create_group(self, name: str, description: Optional[str] = None) -> Group:
        """Create a new group."""
        existing = self.db.query(Group).filter(Group.name == name).first()
        if existing:
            raise Exception(f"Group '{name}' already exists")

        group = Group(name=name, description=description)
        self.db.add(group)
        self.db.commit()
        self.db.refresh(group)
        return group

    def list_groups(self) -> List[Group]:
        """List all groups."""
        return self.db.query(Group).all()

    def get_group(self, group_id: int) -> Optional[Group]:
        """Get group by ID."""
        return self.db.query(Group).filter(Group.id == group_id).first()

    def get_group_by_name(self, name: str) -> Optional[Group]:
        """Get group by name."""
        return self.db.query(Group).filter(Group.name == name).first()

    def delete_group(self, group_id: int) -> bool:
        """Delete group (does not delete packages)."""
        group = self.get_group(group_id)
        if not group:
            return False

        self.db.delete(group)
        self.db.commit()
        return True

    def add_package_to_group(self, group_id: int, package_id: int) -> bool:
        """Add package to group."""
        group = self.get_group(group_id)
        package = self.db.query(Package).filter(Package.id == package_id).first()

        if not group or not package:
            return False

        # Check if already in group
        existing = self.db.query(GroupPackage).filter(
            GroupPackage.group_id == group_id,
            GroupPackage.package_id == package_id
        ).first()

        if existing:
            return True  # Already in group

        group_package = GroupPackage(group_id=group_id, package_id=package_id)
        self.db.add(group_package)
        self.db.commit()
        return True

    def remove_package_from_group(self, group_id: int, package_id: int) -> bool:
        """Remove package from group."""
        result = self.db.query(GroupPackage).filter(
            GroupPackage.group_id == group_id,
            GroupPackage.package_id == package_id
        ).delete()
        self.db.commit()
        return result > 0

    def get_group_packages(self, group_id: int) -> List[Package]:
        """Get all packages in a group."""
        group = self.get_group(group_id)
        if not group:
            return []
        return group.packages
