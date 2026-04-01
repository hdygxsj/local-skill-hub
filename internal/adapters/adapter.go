package adapters

import "github.com/easy-skills/easy-skills/pkg/types"

type IDEAdapter interface {
	Name() string
	GetSkillDir(scope string) (string, error)
	InstallComponent(srcPath, destName string) error
	UninstallComponent(name, path string) error
	ListInstalled(scope string) ([]*types.Component, error)
	GetInstalledPath(name, scope string) (string, error)
}

type InstalledComponent struct {
	Name string
	Path string
	Type string
}
