package cursor

import (
	"os"
	"path/filepath"

	"github.com/easy-skills/easy-skills/pkg/types"
)

type Adapter struct{}

func New() *Adapter {
	return &Adapter{}
}

func (a *Adapter) Name() string { return "cursor" }

func (a *Adapter) GetSkillDir(scope string) (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	if scope == "project" {
		cwd, err := os.Getwd()
		if err != nil {
			return "", err
		}
		return filepath.Join(cwd, ".cursorrules"), nil
	}
	return filepath.Join(home, ".cursorrules"), nil
}

func (a *Adapter) InstallComponent(srcPath, destName string) error {
	dir, err := a.GetSkillDir("user")
	if err != nil {
		return err
	}
	destPath := filepath.Join(dir, destName)

	// Create directory if not exists
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	return os.Rename(srcPath, destPath)
}

func (a *Adapter) UninstallComponent(name, path string) error {
	return os.RemoveAll(path)
}

func (a *Adapter) ListInstalled(scope string) ([]*types.Component, error) {
	dir, err := a.GetSkillDir(scope)
	if err != nil {
		return nil, err
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return []*types.Component{}, nil
		}
		return nil, err
	}

	var components []*types.Component
	for _, entry := range entries {
		if entry.IsDir() {
			components = append(components, &types.Component{
				Name: entry.Name(),
				Type: "skill",
				Path: filepath.Join(dir, entry.Name()),
			})
		}
	}
	return components, nil
}

func (a *Adapter) GetInstalledPath(name, scope string) (string, error) {
	dir, err := a.GetSkillDir(scope)
	if err != nil {
		return "", err
	}
	return filepath.Join(dir, name), nil
}
