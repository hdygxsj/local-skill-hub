"""Agent tools - callable functions for the agent."""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from ..services import PackageService, GroupService, InstallService


class AgentTools:
    """Tools that the agent can call."""

    def __init__(self, db: Session):
        self.db = db
        self.package_service = PackageService(db)
        self.group_service = GroupService(db)
        self.install_service = InstallService(db)

    def import_from_git(self, url: str, name: Optional[str] = None) -> Dict[str, Any]:
        """Import package from Git URL."""
        try:
            package = self.package_service.import_from_git(url, name)
            return {
                "success": True,
                "message": f"成功导入技能包 '{package.name}'，版本: {package.version}",
                "package": {"id": package.id, "name": package.name, "version": package.version}
            }
        except Exception as e:
            return {"success": False, "message": f"导入失败: {str(e)}"}

    def import_from_local(self, path: str, name: Optional[str] = None) -> Dict[str, Any]:
        """Import package from local path."""
        try:
            package = self.package_service.import_from_local(path, name)
            return {
                "success": True,
                "message": f"成功导入技能包 '{package.name}'",
                "package": {"id": package.id, "name": package.name}
            }
        except Exception as e:
            return {"success": False, "message": f"导入失败: {str(e)}"}

    def list_packages(self) -> Dict[str, Any]:
        """List all packages."""
        packages = self.package_service.list_packages()
        return {
            "success": True,
            "packages": [
                {"id": p.id, "name": p.name, "version": p.version}
                for p in packages
            ]
        }

    def create_group(self, name: str, description: Optional[str] = None) -> Dict[str, Any]:
        """Create a new group."""
        try:
            group = self.group_service.create_group(name, description)
            return {
                "success": True,
                "message": f"成功创建分组 '{group.name}'",
                "group": {"id": group.id, "name": group.name}
            }
        except Exception as e:
            return {"success": False, "message": f"创建失败: {str(e)}"}

    def list_groups(self) -> Dict[str, Any]:
        """List all groups."""
        groups = self.group_service.list_groups()
        result = []
        for g in groups:
            result.append({
                "id": g.id,
                "name": g.name,
                "packages": [p.name for p in g.packages]
            })
        return {"success": True, "groups": result}

    def add_to_group(self, group_name: str, package_name: str) -> Dict[str, Any]:
        """Add package to group by name."""
        group = self.group_service.get_group_by_name(group_name)
        if not group:
            return {"success": False, "message": f"分组 '{group_name}' 不存在"}

        packages = self.package_service.list_packages()
        package = next((p for p in packages if p.name == package_name), None)
        if not package:
            return {"success": False, "message": f"技能包 '{package_name}' 不存在"}

        self.group_service.add_package_to_group(group.id, package.id)
        return {
            "success": True,
            "message": f"已将 '{package_name}' 添加到分组 '{group_name}'"
        }

    def install_group(
        self,
        group_name: str,
        target_ide: str,
        install_scope: str,
        install_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """Install group to IDE."""
        group = self.group_service.get_group_by_name(group_name)
        if not group:
            return {"success": False, "message": f"分组 '{group_name}' 不存在"}

        if install_scope == "project" and not install_path:
            return {
                "success": False,
                "message": "项目级安装需要提供项目路径，请告诉我你的项目目录"
            }

        try:
            installation = self.install_service.install_group(
                group.id, target_ide, install_scope, install_path
            )
            return {
                "success": True,
                "message": f"成功将 '{group_name}' 安装到 {target_ide} ({install_scope})",
                "installation": {"id": installation.id, "path": installation.install_path}
            }
        except Exception as e:
            return {"success": False, "message": f"安装失败: {str(e)}"}

    def uninstall(self, installation_id: int) -> Dict[str, Any]:
        """Uninstall by installation ID."""
        try:
            success = self.install_service.uninstall(installation_id)
            if success:
                return {"success": True, "message": "卸载成功"}
            return {"success": False, "message": "安装记录不存在"}
        except Exception as e:
            return {"success": False, "message": f"卸载失败: {str(e)}"}

    def list_installations(self) -> Dict[str, Any]:
        """List all installations."""
        installations = self.install_service.list_installations()
        result = []
        for inst in installations:
            group_name = inst.group.name if inst.group else "未知"
            result.append({
                "id": inst.id,
                "group": group_name,
                "ide": inst.target_ide,
                "scope": inst.install_scope,
                "path": inst.install_path,
                "version": inst.installed_version
            })
        return {"success": True, "installations": result}

    def compare_versions(self, installation_id: int) -> Dict[str, Any]:
        """Compare installed vs local versions."""
        result = self.install_service.compare_versions(installation_id)
        if not result:
            return {"success": False, "message": "安装记录不存在"}
        return {"success": True, **result}

    def get_tools_schema(self) -> List[Dict[str, Any]]:
        """Get OpenAI-compatible tools schema."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "import_from_git",
                    "description": "从 Git URL 导入技能包",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "url": {"type": "string", "description": "Git 仓库 URL"},
                            "name": {"type": "string", "description": "可选的包名称"}
                        },
                        "required": ["url"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "import_from_local",
                    "description": "从本地路径导入技能包",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "path": {"type": "string", "description": "本地路径"},
                            "name": {"type": "string", "description": "可选的包名称"}
                        },
                        "required": ["path"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_packages",
                    "description": "列出所有已导入的技能包",
                    "parameters": {"type": "object", "properties": {}}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "create_group",
                    "description": "创建一个新的分组",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string", "description": "分组名称"},
                            "description": {"type": "string", "description": "分组描述"}
                        },
                        "required": ["name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_groups",
                    "description": "列出所有分组",
                    "parameters": {"type": "object", "properties": {}}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "add_to_group",
                    "description": "将技能包添加到分组",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "group_name": {"type": "string", "description": "分组名称"},
                            "package_name": {"type": "string", "description": "技能包名称"}
                        },
                        "required": ["group_name", "package_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "install_group",
                    "description": "将分组安装到指定 IDE",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "group_name": {"type": "string", "description": "分组名称"},
                            "target_ide": {"type": "string", "enum": ["qoder", "cursor"], "description": "目标 IDE"},
                            "install_scope": {"type": "string", "enum": ["user", "project"], "description": "安装范围"},
                            "install_path": {"type": "string", "description": "项目路径（项目级安装需要）"}
                        },
                        "required": ["group_name", "target_ide", "install_scope"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "uninstall",
                    "description": "卸载已安装的分组",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "installation_id": {"type": "integer", "description": "安装记录 ID"}
                        },
                        "required": ["installation_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_installations",
                    "description": "列出所有安装记录",
                    "parameters": {"type": "object", "properties": {}}
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "compare_versions",
                    "description": "对比已安装版本和本地版本",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "installation_id": {"type": "integer", "description": "安装记录 ID"}
                        },
                        "required": ["installation_id"]
                    }
                }
            }
        ]

    def call_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call a tool by name with arguments."""
        tool_map = {
            "import_from_git": self.import_from_git,
            "import_from_local": self.import_from_local,
            "list_packages": self.list_packages,
            "create_group": self.create_group,
            "list_groups": self.list_groups,
            "add_to_group": self.add_to_group,
            "install_group": self.install_group,
            "uninstall": self.uninstall,
            "list_installations": self.list_installations,
            "compare_versions": self.compare_versions,
        }
        
        if name not in tool_map:
            return {"success": False, "message": f"未知工具: {name}"}
        
        return tool_map[name](**arguments)
