# Local Skill Hub 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended), superpowers:team-driven-development (for 3+ parallel tracks), or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个本地运行的 AI IDE 技能包管理工具，支持包导入、分组管理、安装到 IDE、对话式交互。

**Architecture:** 前后端分离架构。后端使用 FastAPI + SQLite 提供 REST API 和 Agent 对话能力。前端使用 Vue 3 + Vite 提供管理界面和聊天界面。

**Tech Stack:** Python 3.10+, FastAPI, SQLAlchemy, SQLite, Vue 3, Vite, Element Plus

---

## 文件结构

### 后端 (backend/)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI 入口
│   ├── database.py                # 数据库连接
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py              # SQLAlchemy 模型
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── schemas.py             # Pydantic 模型
│   ├── api/
│   │   ├── __init__.py
│   │   ├── packages.py            # 包管理 API
│   │   ├── groups.py              # 分组管理 API
│   │   ├── installations.py       # 安装管理 API
│   │   ├── chat.py                # 对话 API
│   │   └── config.py              # 配置 API
│   ├── services/
│   │   ├── __init__.py
│   │   ├── package_service.py     # 包管理服务
│   │   ├── group_service.py       # 分组服务
│   │   ├── install_service.py     # 安装服务
│   │   └── git_service.py         # Git 操作服务
│   ├── installers/
│   │   ├── __init__.py
│   │   ├── base.py                # 安装器基类
│   │   └── qoder.py               # Qoder 安装器
│   └── agent/
│       ├── __init__.py
│       ├── core.py                # Agent 核心
│       ├── tools.py               # 工具函数
│       └── prompts.py             # 系统提示词
├── tests/
│   ├── __init__.py
│   ├── conftest.py                # pytest 配置
│   ├── test_packages.py
│   ├── test_groups.py
│   ├── test_installations.py
│   └── test_agent.py
├── requirements.txt
└── pytest.ini
```

### 前端 (frontend/)

```
frontend/
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   │   └── index.js
│   ├── api/
│   │   └── index.js
│   ├── views/
│   │   ├── ChatView.vue
│   │   ├── PackagesView.vue
│   │   ├── GroupsView.vue
│   │   ├── InstallationsView.vue
│   │   └── SettingsView.vue
│   └── components/
│       ├── AppLayout.vue
│       ├── ChatMessage.vue
│       ├── PackageCard.vue
│       └── GroupCard.vue
├── index.html
├── package.json
└── vite.config.js
```

---

## Phase 1: 项目基础设施

### Task 1: 初始化后端项目

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/pytest.ini`
- Create: `backend/app/__init__.py`

- [ ] **Step 1: 创建 requirements.txt**

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pydantic==2.5.3
python-multipart==0.0.6
httpx==0.26.0
openai==1.10.0
pytest==7.4.4
pytest-asyncio==0.23.3
```

- [ ] **Step 2: 创建 pytest.ini**

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_functions = test_*
asyncio_mode = auto
```

- [ ] **Step 3: 创建 app/__init__.py**

```python
"""Local Skill Hub Backend"""
```

- [ ] **Step 4: 创建虚拟环境并安装依赖**

Run: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt`

- [ ] **Step 5: 验证安装**

Run: `cd backend && source venv/bin/activate && python -c "import fastapi; print(fastapi.__version__)"`
Expected: `0.109.0`

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "chore: initialize backend project with dependencies"
```

---

### Task 2: 创建数据库模型

**Files:**
- Create: `backend/app/database.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/models.py`

- [ ] **Step 1: 创建 database.py**

```python
"""Database connection and session management."""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 数据目录
DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

DATABASE_URL = f"sqlite:///{DATA_DIR / 'lsh.db'}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
```

- [ ] **Step 2: 创建 models/__init__.py**

```python
"""Database models."""
from .models import Source, Package, Group, GroupPackage, Installation, Config
```

- [ ] **Step 3: 创建 models/models.py**

```python
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
```

- [ ] **Step 4: 验证模型定义**

Run: `cd backend && source venv/bin/activate && python -c "from app.models import Source, Package, Group; print('Models OK')"`
Expected: `Models OK`

- [ ] **Step 5: Commit**

```bash
git add backend/app/
git commit -m "feat: add database connection and SQLAlchemy models"
```

---

### Task 3: 创建 Pydantic 模式

**Files:**
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/schemas.py`

- [ ] **Step 1: 创建 schemas/__init__.py**

```python
"""Pydantic schemas."""
from .schemas import (
    SourceCreate, SourceResponse,
    PackageCreate, PackageResponse, PackageDetail,
    GroupCreate, GroupResponse, GroupDetail,
    InstallationCreate, InstallationResponse,
    ConfigUpdate, ConfigResponse,
    ChatMessage, ChatResponse,
)
```

- [ ] **Step 2: 创建 schemas/schemas.py**

```python
"""Pydantic models for request/response validation."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# Source schemas
class SourceCreate(BaseModel):
    type: str  # 'git' | 'guide' | 'local'
    url_or_path: str


class SourceResponse(BaseModel):
    id: int
    type: str
    url_or_path: str
    created_at: datetime

    class Config:
        from_attributes = True


# Package schemas
class PackageCreate(BaseModel):
    source_type: str  # 'git' | 'guide' | 'local'
    url_or_path: str
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
    target_ide: str  # 'qoder' | 'cursor'
    install_scope: str  # 'user' | 'project'
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
```

- [ ] **Step 3: 验证 schemas**

Run: `cd backend && source venv/bin/activate && python -c "from app.schemas import PackageCreate, GroupCreate; print('Schemas OK')"`
Expected: `Schemas OK`

- [ ] **Step 4: Commit**

```bash
git add backend/app/schemas/
git commit -m "feat: add Pydantic schemas for API validation"
```

---

### Task 4: 创建 FastAPI 主入口

**Files:**
- Create: `backend/app/main.py`

- [ ] **Step 1: 创建 main.py**

```python
"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db

app = FastAPI(
    title="Local Skill Hub",
    description="AI IDE 技能包管理工具",
    version="0.1.0",
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    """Initialize database on startup."""
    init_db()


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "local-skill-hub"}


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy"}
```

- [ ] **Step 2: 启动服务器测试**

Run: `cd backend && source venv/bin/activate && timeout 5 uvicorn app.main:app --port 3847 || true`

- [ ] **Step 3: 验证 API 响应**

Run: `curl -s http://localhost:3847/ 2>/dev/null || echo "Server test complete"`

- [ ] **Step 4: Commit**

```bash
git add backend/app/main.py
git commit -m "feat: add FastAPI application entry point"
```

---

### Task 5: 初始化前端项目

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "local-skill-hub-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix"
  },
  "dependencies": {
    "vue": "^3.4.15",
    "vue-router": "^4.2.5",
    "element-plus": "^2.5.3",
    "@element-plus/icons-vue": "^2.3.1",
    "axios": "^1.6.5",
    "marked": "^11.1.1"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.3",
    "vite": "^5.0.11"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3847',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

- [ ] **Step 3: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Local Skill Hub</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: 安装依赖**

Run: `cd frontend && npm install`

- [ ] **Step 5: Commit**

```bash
git add frontend/
git commit -m "chore: initialize frontend project with Vue 3 and Vite"
```

---

### Task 6: 创建前端入口和路由

**Files:**
- Create: `frontend/src/main.js`
- Create: `frontend/src/App.vue`
- Create: `frontend/src/router/index.js`

- [ ] **Step 1: 创建 main.js**

```javascript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.mount('#app')
```

- [ ] **Step 2: 创建 App.vue**

```vue
<template>
  <router-view />
</template>

<script setup>
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
```

- [ ] **Step 3: 创建 router/index.js**

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/ChatView.vue')
  },
  {
    path: '/packages',
    name: 'Packages',
    component: () => import('../views/PackagesView.vue')
  },
  {
    path: '/groups',
    name: 'Groups',
    component: () => import('../views/GroupsView.vue')
  },
  {
    path: '/installations',
    name: 'Installations',
    component: () => import('../views/InstallationsView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/
git commit -m "feat: add Vue app entry and router configuration"
```

---

## Phase 2: 后端核心服务

### Task 7: 创建包管理服务

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/git_service.py`
- Create: `backend/app/services/package_service.py`

- [ ] **Step 1: 创建 services/__init__.py**

```python
"""Business logic services."""
from .git_service import GitService
from .package_service import PackageService
from .group_service import GroupService
from .install_service import InstallService
```

- [ ] **Step 2: 创建 git_service.py**

```python
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
```

- [ ] **Step 3: 创建 package_service.py**

```python
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
```

- [ ] **Step 4: 验证服务**

Run: `cd backend && source venv/bin/activate && python -c "from app.services.package_service import PackageService; print('Service OK')"`
Expected: `Service OK`

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/
git commit -m "feat: add Git service and package management service"
```

---

### Task 8: 创建分组服务

**Files:**
- Create: `backend/app/services/group_service.py`

- [ ] **Step 1: 创建 group_service.py**

```python
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/services/group_service.py
git commit -m "feat: add group management service"
```

---

### Task 9: 创建安装服务和 Qoder 安装器

**Files:**
- Create: `backend/app/installers/__init__.py`
- Create: `backend/app/installers/base.py`
- Create: `backend/app/installers/qoder.py`
- Create: `backend/app/services/install_service.py`

- [ ] **Step 1: 创建 installers/__init__.py**

```python
"""IDE installers."""
from .base import BaseInstaller
from .qoder import QoderInstaller
```

- [ ] **Step 2: 创建 installers/base.py**

```python
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
```

- [ ] **Step 3: 创建 installers/qoder.py**

```python
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
```

- [ ] **Step 4: 创建 install_service.py**

```python
"""Installation management service."""
import json
from typing import List, Optional
from pathlib import Path

from sqlalchemy.orm import Session

from ..models import Installation, Group
from ..installers import QoderInstaller


class InstallService:
    """Handle installation operations."""

    def __init__(self, db: Session):
        self.db = db
        self.installers = {
            "qoder": QoderInstaller(),
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
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/installers/ backend/app/services/install_service.py
git commit -m "feat: add Qoder installer and installation service"
```

---

## Phase 3: 后端 API

### Task 10: 创建包管理 API

**Files:**
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/packages.py`

- [ ] **Step 1: 创建 api/__init__.py**

```python
"""API routes."""
from fastapi import APIRouter
from .packages import router as packages_router
from .groups import router as groups_router
from .installations import router as installations_router
from .config import router as config_router
from .chat import router as chat_router

api_router = APIRouter()

api_router.include_router(packages_router, prefix="/packages", tags=["packages"])
api_router.include_router(groups_router, prefix="/groups", tags=["groups"])
api_router.include_router(installations_router, prefix="/installations", tags=["installations"])
api_router.include_router(config_router, prefix="/config", tags=["config"])
api_router.include_router(chat_router, prefix="/chat", tags=["chat"])
```

- [ ] **Step 2: 创建 packages.py**

```python
"""Package management API."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import PackageCreate, PackageResponse, PackageDetail
from ..services import PackageService

router = APIRouter()


@router.get("/", response_model=List[PackageResponse])
def list_packages(db: Session = Depends(get_db)):
    """List all packages."""
    service = PackageService(db)
    return service.list_packages()


@router.get("/{package_id}", response_model=PackageDetail)
def get_package(package_id: int, db: Session = Depends(get_db)):
    """Get package details."""
    service = PackageService(db)
    package = service.get_package(package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return package


@router.post("/", response_model=PackageResponse)
def import_package(data: PackageCreate, db: Session = Depends(get_db)):
    """Import a package."""
    service = PackageService(db)
    try:
        if data.source_type == "git":
            return service.import_from_git(data.url_or_path, data.name)
        elif data.source_type == "local":
            return service.import_from_local(data.url_or_path, data.name)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported source type: {data.source_type}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{package_id}")
def delete_package(package_id: int, db: Session = Depends(get_db)):
    """Delete a package."""
    service = PackageService(db)
    if not service.delete_package(package_id):
        raise HTTPException(status_code=404, detail="Package not found")
    return {"status": "deleted"}
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/
git commit -m "feat: add package management API"
```

---

### Task 11: 创建分组和安装 API

**Files:**
- Create: `backend/app/api/groups.py`
- Create: `backend/app/api/installations.py`

- [ ] **Step 1: 创建 groups.py**

```python
"""Group management API."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import GroupCreate, GroupResponse, GroupDetail, PackageResponse
from ..services import GroupService

router = APIRouter()


@router.get("/", response_model=List[GroupResponse])
def list_groups(db: Session = Depends(get_db)):
    """List all groups."""
    service = GroupService(db)
    return service.list_groups()


@router.get("/{group_id}", response_model=GroupDetail)
def get_group(group_id: int, db: Session = Depends(get_db)):
    """Get group details with packages."""
    service = GroupService(db)
    group = service.get_group(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@router.post("/", response_model=GroupResponse)
def create_group(data: GroupCreate, db: Session = Depends(get_db)):
    """Create a new group."""
    service = GroupService(db)
    try:
        return service.create_group(data.name, data.description)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{group_id}")
def delete_group(group_id: int, db: Session = Depends(get_db)):
    """Delete a group."""
    service = GroupService(db)
    if not service.delete_group(group_id):
        raise HTTPException(status_code=404, detail="Group not found")
    return {"status": "deleted"}


@router.post("/{group_id}/packages/{package_id}")
def add_package_to_group(group_id: int, package_id: int, db: Session = Depends(get_db)):
    """Add package to group."""
    service = GroupService(db)
    if not service.add_package_to_group(group_id, package_id):
        raise HTTPException(status_code=404, detail="Group or package not found")
    return {"status": "added"}


@router.delete("/{group_id}/packages/{package_id}")
def remove_package_from_group(group_id: int, package_id: int, db: Session = Depends(get_db)):
    """Remove package from group."""
    service = GroupService(db)
    if not service.remove_package_from_group(group_id, package_id):
        raise HTTPException(status_code=404, detail="Package not in group")
    return {"status": "removed"}
```

- [ ] **Step 2: 创建 installations.py**

```python
"""Installation management API."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import InstallationCreate, InstallationResponse
from ..services import InstallService

router = APIRouter()


@router.get("/", response_model=List[InstallationResponse])
def list_installations(db: Session = Depends(get_db)):
    """List all installations."""
    service = InstallService(db)
    return service.list_installations()


@router.get("/{installation_id}", response_model=InstallationResponse)
def get_installation(installation_id: int, db: Session = Depends(get_db)):
    """Get installation details."""
    service = InstallService(db)
    installation = service.get_installation(installation_id)
    if not installation:
        raise HTTPException(status_code=404, detail="Installation not found")
    return installation


@router.post("/", response_model=InstallationResponse)
def install_group(data: InstallationCreate, db: Session = Depends(get_db)):
    """Install a group to IDE."""
    service = InstallService(db)
    try:
        return service.install_group(
            data.group_id,
            data.target_ide,
            data.install_scope,
            data.install_path
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{installation_id}")
def uninstall(installation_id: int, db: Session = Depends(get_db)):
    """Uninstall by ID."""
    service = InstallService(db)
    if not service.uninstall(installation_id):
        raise HTTPException(status_code=404, detail="Installation not found")
    return {"status": "uninstalled"}


@router.get("/{installation_id}/compare")
def compare_versions(installation_id: int, db: Session = Depends(get_db)):
    """Compare installed vs local versions."""
    service = InstallService(db)
    result = service.compare_versions(installation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Installation not found")
    return result


@router.post("/{installation_id}/upgrade", response_model=InstallationResponse)
def upgrade_installation(installation_id: int, db: Session = Depends(get_db)):
    """Upgrade installation to latest local version."""
    service = InstallService(db)
    installation = service.get_installation(installation_id)
    if not installation:
        raise HTTPException(status_code=404, detail="Installation not found")
    
    # Reinstall (switch to same group)
    try:
        return service.switch_group(
            installation_id,
            installation.group_id,
            installation.target_ide,
            installation.install_scope,
            installation.install_path if installation.install_scope == "project" else None
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/groups.py backend/app/api/installations.py
git commit -m "feat: add groups and installations API"
```

---

### Task 12: 创建配置 API 并注册路由

**Files:**
- Create: `backend/app/api/config.py`
- Create: `backend/app/api/chat.py` (placeholder)
- Modify: `backend/app/main.py`

- [ ] **Step 1: 创建 config.py**

```python
"""Configuration API."""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import ConfigUpdate, ConfigResponse
from ..models import Config

router = APIRouter()


@router.get("/", response_model=List[ConfigResponse])
def list_config(db: Session = Depends(get_db)):
    """List all configuration."""
    return db.query(Config).all()


@router.get("/{key}", response_model=ConfigResponse)
def get_config(key: str, db: Session = Depends(get_db)):
    """Get configuration value."""
    config = db.query(Config).filter(Config.key == key).first()
    if not config:
        return ConfigResponse(key=key, value=None, updated_at=None)
    return config


@router.put("/{key}", response_model=ConfigResponse)
def set_config(key: str, data: ConfigUpdate, db: Session = Depends(get_db)):
    """Set configuration value."""
    config = db.query(Config).filter(Config.key == key).first()
    if config:
        config.value = data.value
    else:
        config = Config(key=key, value=data.value)
        db.add(config)
    db.commit()
    db.refresh(config)
    return config
```

- [ ] **Step 2: 创建 chat.py (placeholder)**

```python
"""Chat API (placeholder)."""
from fastapi import APIRouter

from ..schemas import ChatMessage, ChatResponse

router = APIRouter()


@router.post("/", response_model=ChatResponse)
def chat(message: ChatMessage):
    """Chat with Agent (placeholder)."""
    return ChatResponse(
        response="Agent 功能即将实现。目前请使用 API 直接操作。",
        tool_calls=None
    )
```

- [ ] **Step 3: 更新 main.py 注册路由**

```python
"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .api import api_router

app = FastAPI(
    title="Local Skill Hub",
    description="AI IDE 技能包管理工具",
    version="0.1.0",
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router, prefix="/api")


@app.on_event("startup")
def startup():
    """Initialize database on startup."""
    init_db()


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "local-skill-hub"}


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy"}
```

- [ ] **Step 4: 验证 API**

Run: `cd backend && source venv/bin/activate && python -c "from app.main import app; print('API OK')"`
Expected: `API OK`

- [ ] **Step 5: Commit**

```bash
git add backend/app/
git commit -m "feat: add config API, chat placeholder, and register routes"
```

---

## Phase 4: 前端界面

### Task 13: 创建前端 API 模块和布局

**Files:**
- Create: `frontend/src/api/index.js`
- Create: `frontend/src/components/AppLayout.vue`

- [ ] **Step 1: 创建 api/index.js**

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// Packages
export const listPackages = () => api.get('/packages/')
export const getPackage = (id) => api.get(`/packages/${id}`)
export const importPackage = (data) => api.post('/packages/', data)
export const deletePackage = (id) => api.delete(`/packages/${id}`)

// Groups
export const listGroups = () => api.get('/groups/')
export const getGroup = (id) => api.get(`/groups/${id}`)
export const createGroup = (data) => api.post('/groups/', data)
export const deleteGroup = (id) => api.delete(`/groups/${id}`)
export const addPackageToGroup = (groupId, packageId) => 
  api.post(`/groups/${groupId}/packages/${packageId}`)
export const removePackageFromGroup = (groupId, packageId) => 
  api.delete(`/groups/${groupId}/packages/${packageId}`)

// Installations
export const listInstallations = () => api.get('/installations/')
export const getInstallation = (id) => api.get(`/installations/${id}`)
export const installGroup = (data) => api.post('/installations/', data)
export const uninstall = (id) => api.delete(`/installations/${id}`)
export const compareVersions = (id) => api.get(`/installations/${id}/compare`)
export const upgradeInstallation = (id) => api.post(`/installations/${id}/upgrade`)

// Config
export const getConfig = (key) => api.get(`/config/${key}`)
export const setConfig = (key, value) => api.put(`/config/${key}`, { key, value })

// Chat
export const sendMessage = (message) => api.post('/chat/', { message })

export default api
```

- [ ] **Step 2: 创建 AppLayout.vue**

```vue
<template>
  <el-container class="app-layout">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>LSH</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="menu"
      >
        <el-menu-item index="/chat">
          <el-icon><ChatDotRound /></el-icon>
          <span>对话</span>
        </el-menu-item>
        <el-menu-item index="/packages">
          <el-icon><Box /></el-icon>
          <span>技能包</span>
        </el-menu-item>
        <el-menu-item index="/groups">
          <el-icon><Folder /></el-icon>
          <span>分组</span>
        </el-menu-item>
        <el-menu-item index="/installations">
          <el-icon><Download /></el-icon>
          <span>安装</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="main-content">
      <slot></slot>
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.app-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo h2 {
  margin: 0;
  font-size: 20px;
}

.menu {
  border-right: none;
  background-color: transparent;
}

.menu .el-menu-item {
  color: #bfcbd9;
}

.menu .el-menu-item:hover,
.menu .el-menu-item.is-active {
  background-color: #263445;
  color: #409eff;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/ frontend/src/components/
git commit -m "feat: add frontend API module and AppLayout component"
```

---

### Task 14: 创建主要视图页面

**Files:**
- Create: `frontend/src/views/ChatView.vue`
- Create: `frontend/src/views/PackagesView.vue`
- Create: `frontend/src/views/GroupsView.vue`
- Create: `frontend/src/views/InstallationsView.vue`
- Create: `frontend/src/views/SettingsView.vue`

- [ ] **Step 1: 创建 ChatView.vue**

```vue
<template>
  <AppLayout>
    <div class="chat-view">
      <div class="chat-messages" ref="messagesRef">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.role]"
        >
          <div class="message-content">
            <div class="avatar">{{ msg.role === 'user' ? '你' : 'AI' }}</div>
            <div class="text">{{ msg.content }}</div>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <el-input
          v-model="input"
          placeholder="输入消息..."
          @keyup.enter="sendMessage"
          :disabled="loading"
        >
          <template #append>
            <el-button @click="sendMessage" :loading="loading">
              发送
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { sendMessage as apiSendMessage } from '../api'
import AppLayout from '../components/AppLayout.vue'

const messages = ref([
  { role: 'assistant', content: '你好！我是 Local Skill Hub 助手。我可以帮你管理技能包、分组和安装。请问有什么可以帮你的？' }
])
const input = ref('')
const loading = ref(false)
const messagesRef = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!input.value.trim() || loading.value) return

  const userMessage = input.value.trim()
  messages.value.push({ role: 'user', content: userMessage })
  input.value = ''
  scrollToBottom()

  loading.value = true
  try {
    const response = await apiSendMessage(userMessage)
    messages.value.push({ role: 'assistant', content: response.data.response })
  } catch (error) {
    messages.value.push({ role: 'assistant', content: '抱歉，发生了错误：' + error.message })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  background: white;
  border-radius: 8px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  margin-bottom: 16px;
}

.message-content {
  display: flex;
  gap: 12px;
}

.message.user .message-content {
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.message.user .avatar {
  background: #67c23a;
}

.text {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  background: #f4f4f5;
  line-height: 1.5;
}

.message.user .text {
  background: #ecf5ff;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #eee;
}
</style>
```

- [ ] **Step 2: 创建 PackagesView.vue**

```vue
<template>
  <AppLayout>
    <div class="packages-view">
      <div class="header">
        <h2>技能包管理</h2>
        <el-button type="primary" @click="showImportDialog = true">
          导入技能包
        </el-button>
      </div>

      <el-table :data="packages" v-loading="loading" stripe>
        <el-table-column prop="name" label="名称" width="200" />
        <el-table-column prop="version" label="版本" width="120" />
        <el-table-column prop="local_path" label="本地路径" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Import Dialog -->
      <el-dialog v-model="showImportDialog" title="导入技能包" width="500px">
        <el-form :model="importForm" label-width="80px">
          <el-form-item label="来源">
            <el-select v-model="importForm.source_type">
              <el-option label="Git 仓库" value="git" />
              <el-option label="本地路径" value="local" />
            </el-select>
          </el-form-item>
          <el-form-item label="地址">
            <el-input 
              v-model="importForm.url_or_path" 
              :placeholder="importForm.source_type === 'git' ? 'https://github.com/...' : '/path/to/package'"
            />
          </el-form-item>
          <el-form-item label="名称">
            <el-input v-model="importForm.name" placeholder="可选，默认从地址提取" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showImportDialog = false">取消</el-button>
          <el-button type="primary" @click="handleImport" :loading="importing">
            导入
          </el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listPackages, importPackage, deletePackage } from '../api'
import AppLayout from '../components/AppLayout.vue'

const packages = ref([])
const loading = ref(false)
const showImportDialog = ref(false)
const importing = ref(false)
const importForm = ref({
  source_type: 'git',
  url_or_path: '',
  name: ''
})

const fetchPackages = async () => {
  loading.value = true
  try {
    const response = await listPackages()
    packages.value = response.data
  } catch (error) {
    ElMessage.error('获取技能包列表失败')
  } finally {
    loading.value = false
  }
}

const handleImport = async () => {
  if (!importForm.value.url_or_path) {
    ElMessage.warning('请输入地址')
    return
  }
  importing.value = true
  try {
    await importPackage(importForm.value)
    ElMessage.success('导入成功')
    showImportDialog.value = false
    importForm.value = { source_type: 'git', url_or_path: '', name: '' }
    fetchPackages()
  } catch (error) {
    ElMessage.error('导入失败: ' + (error.response?.data?.detail || error.message))
  } finally {
    importing.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除技能包 "${row.name}"？`, '确认删除')
    await deletePackage(row.id)
    ElMessage.success('删除成功')
    fetchPackages()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(fetchPackages)
</script>

<style scoped>
.packages-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}
</style>
```

- [ ] **Step 3: 创建 GroupsView.vue**

```vue
<template>
  <AppLayout>
    <div class="groups-view">
      <div class="header">
        <h2>分组管理</h2>
        <el-button type="primary" @click="showCreateDialog = true">
          创建分组
        </el-button>
      </div>

      <el-table :data="groups" v-loading="loading" stripe>
        <el-table-column prop="name" label="名称" width="200" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="包含技能包" width="300">
          <template #default="{ row }">
            <el-tag v-for="pkg in row.packages" :key="pkg.id" style="margin-right: 4px">
              {{ pkg.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="showAddPackage(row)">添加包</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Create Dialog -->
      <el-dialog v-model="showCreateDialog" title="创建分组" width="400px">
        <el-form :model="createForm" label-width="60px">
          <el-form-item label="名称">
            <el-input v-model="createForm.name" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="createForm.description" type="textarea" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">创建</el-button>
        </template>
      </el-dialog>

      <!-- Add Package Dialog -->
      <el-dialog v-model="showAddDialog" title="添加技能包" width="400px">
        <el-select v-model="selectedPackageId" placeholder="选择技能包" style="width: 100%">
          <el-option
            v-for="pkg in availablePackages"
            :key="pkg.id"
            :label="pkg.name"
            :value="pkg.id"
          />
        </el-select>
        <template #footer>
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="handleAddPackage">添加</el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listGroups, getGroup, createGroup, deleteGroup, addPackageToGroup, listPackages } from '../api'
import AppLayout from '../components/AppLayout.vue'

const groups = ref([])
const packages = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)
const showAddDialog = ref(false)
const selectedGroupId = ref(null)
const selectedPackageId = ref(null)
const createForm = ref({ name: '', description: '' })

const availablePackages = computed(() => {
  const group = groups.value.find(g => g.id === selectedGroupId.value)
  const existingIds = group?.packages?.map(p => p.id) || []
  return packages.value.filter(p => !existingIds.includes(p.id))
})

const fetchData = async () => {
  loading.value = true
  try {
    const [groupsRes, packagesRes] = await Promise.all([listGroups(), listPackages()])
    // Get full group details with packages
    const groupDetails = await Promise.all(
      groupsRes.data.map(g => getGroup(g.id).then(r => r.data))
    )
    groups.value = groupDetails
    packages.value = packagesRes.data
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  if (!createForm.value.name) {
    ElMessage.warning('请输入名称')
    return
  }
  try {
    await createGroup(createForm.value)
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    createForm.value = { name: '', description: '' }
    fetchData()
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除分组 "${row.name}"？`, '确认删除')
    await deleteGroup(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const showAddPackage = (group) => {
  selectedGroupId.value = group.id
  selectedPackageId.value = null
  showAddDialog.value = true
}

const handleAddPackage = async () => {
  if (!selectedPackageId.value) {
    ElMessage.warning('请选择技能包')
    return
  }
  try {
    await addPackageToGroup(selectedGroupId.value, selectedPackageId.value)
    ElMessage.success('添加成功')
    showAddDialog.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.groups-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}
</style>
```

- [ ] **Step 4: 创建 InstallationsView.vue**

```vue
<template>
  <AppLayout>
    <div class="installations-view">
      <div class="header">
        <h2>安装管理</h2>
        <el-button type="primary" @click="showInstallDialog = true">
          安装分组
        </el-button>
      </div>

      <el-table :data="installations" v-loading="loading" stripe>
        <el-table-column label="分组" width="150">
          <template #default="{ row }">
            {{ getGroupName(row.group_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="target_ide" label="目标 IDE" width="100" />
        <el-table-column prop="install_scope" label="范围" width="100" />
        <el-table-column prop="install_path" label="安装路径" />
        <el-table-column prop="installed_version" label="版本" width="100" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleUpgrade(row)">升级</el-button>
            <el-button type="danger" size="small" @click="handleUninstall(row)">卸载</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Install Dialog -->
      <el-dialog v-model="showInstallDialog" title="安装分组" width="500px">
        <el-form :model="installForm" label-width="100px">
          <el-form-item label="分组">
            <el-select v-model="installForm.group_id" style="width: 100%">
              <el-option
                v-for="group in groups"
                :key="group.id"
                :label="group.name"
                :value="group.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="目标 IDE">
            <el-select v-model="installForm.target_ide" style="width: 100%">
              <el-option label="Qoder" value="qoder" />
              <el-option label="Cursor" value="cursor" disabled />
            </el-select>
          </el-form-item>
          <el-form-item label="安装范围">
            <el-select v-model="installForm.install_scope" style="width: 100%">
              <el-option label="用户级" value="user" />
              <el-option label="项目级" value="project" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="installForm.install_scope === 'project'" label="项目路径">
            <el-input v-model="installForm.install_path" placeholder="/path/to/your/project" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showInstallDialog = false">取消</el-button>
          <el-button type="primary" @click="handleInstall" :loading="installing">
            安装
          </el-button>
        </template>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listInstallations, installGroup, uninstall, upgradeInstallation, listGroups } from '../api'
import AppLayout from '../components/AppLayout.vue'

const installations = ref([])
const groups = ref([])
const loading = ref(false)
const showInstallDialog = ref(false)
const installing = ref(false)
const installForm = ref({
  group_id: null,
  target_ide: 'qoder',
  install_scope: 'user',
  install_path: ''
})

const getGroupName = (groupId) => {
  const group = groups.value.find(g => g.id === groupId)
  return group?.name || '-'
}

const fetchData = async () => {
  loading.value = true
  try {
    const [installRes, groupsRes] = await Promise.all([listInstallations(), listGroups()])
    installations.value = installRes.data
    groups.value = groupsRes.data
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleInstall = async () => {
  if (!installForm.value.group_id) {
    ElMessage.warning('请选择分组')
    return
  }
  if (installForm.value.install_scope === 'project' && !installForm.value.install_path) {
    ElMessage.warning('请输入项目路径')
    return
  }
  installing.value = true
  try {
    await installGroup(installForm.value)
    ElMessage.success('安装成功')
    showInstallDialog.value = false
    installForm.value = { group_id: null, target_ide: 'qoder', install_scope: 'user', install_path: '' }
    fetchData()
  } catch (error) {
    ElMessage.error('安装失败: ' + (error.response?.data?.detail || error.message))
  } finally {
    installing.value = false
  }
}

const handleUninstall = async (row) => {
  try {
    await ElMessageBox.confirm('确定卸载此安装？', '确认卸载')
    await uninstall(row.id)
    ElMessage.success('卸载成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('卸载失败')
    }
  }
}

const handleUpgrade = async (row) => {
  try {
    await ElMessageBox.confirm('确定升级到最新版本？', '确认升级')
    await upgradeInstallation(row.id)
    ElMessage.success('升级成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('升级失败')
    }
  }
}

onMounted(fetchData)
</script>

<style scoped>
.installations-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}
</style>
```

- [ ] **Step 5: 创建 SettingsView.vue**

```vue
<template>
  <AppLayout>
    <div class="settings-view">
      <h2>设置</h2>

      <el-card class="setting-card">
        <template #header>
          <span>API 配置</span>
        </template>
        <el-form label-width="120px">
          <el-form-item label="API Key">
            <el-input
              v-model="apiKey"
              type="password"
              show-password
              placeholder="输入 LLM API Key"
            />
          </el-form-item>
          <el-form-item label="API Base URL">
            <el-input
              v-model="apiBaseUrl"
              placeholder="https://api.openai.com/v1"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveConfig" :loading="saving">
              保存
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="setting-card" style="margin-top: 20px">
        <template #header>
          <span>关于</span>
        </template>
        <p>Local Skill Hub v0.1.0</p>
        <p>AI IDE 技能包管理工具</p>
        <p>
          <a href="https://github.com/your-username/local-skill-hub" target="_blank">
            GitHub
          </a>
        </p>
      </el-card>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getConfig, setConfig } from '../api'
import AppLayout from '../components/AppLayout.vue'

const apiKey = ref('')
const apiBaseUrl = ref('')
const saving = ref(false)

const fetchConfig = async () => {
  try {
    const [keyRes, urlRes] = await Promise.all([
      getConfig('api_key'),
      getConfig('api_base_url')
    ])
    apiKey.value = keyRes.data.value || ''
    apiBaseUrl.value = urlRes.data.value || ''
  } catch (error) {
    console.error('Failed to fetch config')
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    await Promise.all([
      setConfig('api_key', apiKey.value),
      setConfig('api_base_url', apiBaseUrl.value)
    ])
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(fetchConfig)
</script>

<style scoped>
.settings-view {
  max-width: 600px;
}

.settings-view h2 {
  margin-bottom: 20px;
}

.setting-card {
  background: white;
}
</style>
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/views/
git commit -m "feat: add all frontend view pages"
```

---

## Phase 5: 测试和收尾

### Task 15: 添加后端测试

**Files:**
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_packages.py`

- [ ] **Step 1: 创建 tests/__init__.py**

```python
"""Test package."""
```

- [ ] **Step 2: 创建 conftest.py**

```python
"""Pytest configuration and fixtures."""
import os
import tempfile
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.main import app
from app.database import get_db


@pytest.fixture
def temp_db():
    """Create a temporary database for testing."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name

    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    
    yield TestingSessionLocal()
    
    # Cleanup
    os.unlink(db_path)
    app.dependency_overrides.clear()


@pytest.fixture
def client(temp_db):
    """Create a test client."""
    from fastapi.testclient import TestClient
    return TestClient(app)
```

- [ ] **Step 3: 创建 test_packages.py**

```python
"""Tests for package management."""
import pytest


def test_list_packages_empty(client):
    """Test listing packages when empty."""
    response = client.get("/api/packages/")
    assert response.status_code == 200
    assert response.json() == []


def test_create_group(client):
    """Test creating a group."""
    response = client.post("/api/groups/", json={
        "name": "test-group",
        "description": "Test group"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "test-group"
    assert data["description"] == "Test group"


def test_list_groups(client):
    """Test listing groups."""
    # Create a group first
    client.post("/api/groups/", json={"name": "group1"})
    
    response = client.get("/api/groups/")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_delete_group(client):
    """Test deleting a group."""
    # Create a group
    create_response = client.post("/api/groups/", json={"name": "to-delete"})
    group_id = create_response.json()["id"]
    
    # Delete it
    delete_response = client.delete(f"/api/groups/{group_id}")
    assert delete_response.status_code == 200
    
    # Verify it's gone
    list_response = client.get("/api/groups/")
    assert len(list_response.json()) == 0


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

- [ ] **Step 4: 运行测试**

Run: `cd backend && source venv/bin/activate && pytest -v`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add backend/tests/
git commit -m "test: add backend tests for packages and groups"
```

---

### Task 16: 最终验证和清理

**Files:**
- Modify: `.gitignore` if needed

- [ ] **Step 1: 验证后端启动**

Run: `cd backend && source venv/bin/activate && uvicorn app.main:app --port 3847 &`
Run: `sleep 2 && curl -s http://localhost:3847/health`
Expected: `{"status":"healthy"}`

- [ ] **Step 2: 验证前端构建**

Run: `cd frontend && npm run build`
Expected: Build completes without errors

- [ ] **Step 3: 停止后端**

Run: `pkill -f "uvicorn app.main:app" || true`

- [ ] **Step 4: 更新 .gitignore 确保数据目录被忽略**

Verify that `data/` is in `.gitignore`

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and verification"
```

---

## 执行摘要

| Phase | 任务数 | 说明 |
|-------|--------|------|
| Phase 1 | 6 | 项目基础设施（后端/前端初始化、数据库模型） |
| Phase 2 | 3 | 后端核心服务（包管理、分组、安装） |
| Phase 3 | 3 | 后端 API（REST 接口） |
| Phase 4 | 2 | 前端界面（布局和视图页面） |
| Phase 5 | 2 | 测试和收尾 |

**总计：16 个任务**

后续扩展（不在本计划内）：
- Agent 对话功能完整实现
- Cursor 安装器
- 更多测试覆盖
