"""Pydantic models for request/response validation."""
from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


# Enums for validation
class SourceType(str, Enum):
    git = "git"
    guide = "guide"
    local = "local"


class TargetIDE(str, Enum):
    qoder = "qoder"
    cursor = "cursor"


class InstallScope(str, Enum):
    user = "user"
    project = "project"


# Source schemas
class SourceCreate(BaseModel):
    type: SourceType
    url_or_path: str = Field(..., min_length=1)


class SourceResponse(BaseModel):
    id: int
    type: str
    url_or_path: str
    created_at: datetime

    class Config:
        from_attributes = True


# Package schemas
class PackageCreate(BaseModel):
    source_type: SourceType
    url_or_path: str = Field(..., min_length=1)
    name: Optional[str] = None


class PackageResponse(BaseModel):
    id: int
    name: str
    version: Optional[str]
    local_path: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PackageDetail(PackageResponse):
    source: Optional[SourceResponse]
    metadata_json: Optional[str]


# Group schemas
class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None


class GroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class GroupDetail(GroupResponse):
    packages: List[PackageResponse]


# Installation schemas
class InstallationCreate(BaseModel):
    group_id: int
    target_ide: TargetIDE
    install_scope: InstallScope
    install_path: Optional[str] = None  # Required for 'project' scope


class InstallationResponse(BaseModel):
    id: int
    group_id: int
    target_ide: str
    install_scope: str
    install_path: str
    installed_version: Optional[str]
    installed_at: datetime

    class Config:
        from_attributes = True


# Config schemas
class ConfigUpdate(BaseModel):
    key: str
    value: str


class ConfigResponse(BaseModel):
    key: str
    value: Optional[str]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Chat schemas
class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    tool_calls: Optional[List[dict]] = None
