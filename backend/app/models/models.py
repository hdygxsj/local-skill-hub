"""SQLAlchemy ORM models."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from ..database import Base


class Source(Base):
    """Package source (git, guide, local)."""
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(20), nullable=False)  # 'git' | 'guide' | 'local'
    url_or_path = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    packages = relationship("Package", back_populates="source")


class Package(Base):
    """Local package."""
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"))
    name = Column(String(100), nullable=False)
    version = Column(String(100))
    local_path = Column(Text, nullable=False)
    metadata_json = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    source = relationship("Source", back_populates="packages")
    groups = relationship("Group", secondary="group_packages", back_populates="packages")


class Group(Base):
    """Package group."""
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    packages = relationship("Package", secondary="group_packages", back_populates="groups")
    installations = relationship("Installation", back_populates="group")


class GroupPackage(Base):
    """Group-Package association."""
    __tablename__ = "group_packages"

    group_id = Column(Integer, ForeignKey("groups.id", ondelete="CASCADE"), primary_key=True)
    package_id = Column(Integer, ForeignKey("packages.id", ondelete="CASCADE"), primary_key=True)


class Installation(Base):
    """Installation record."""
    __tablename__ = "installations"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"))
    target_ide = Column(String(20), nullable=False)  # 'qoder' | 'cursor'
    install_scope = Column(String(20), nullable=False)  # 'user' | 'project'
    install_path = Column(Text, nullable=False)
    installed_files_json = Column(Text)
    installed_version = Column(String(100))
    installed_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group", back_populates="installations")


class Config(Base):
    """System configuration."""
    __tablename__ = "config"

    key = Column(String(100), primary_key=True)
    value = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
