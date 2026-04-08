package hub

import (
	"os"

	"github.com/easy-skills/easy-skills/pkg/types"
	"github.com/google/uuid"
)

func (h *Hub) CreateComponent(packageID, versionID, name, cType, path string) (*types.Component, error) {
	comp := &types.Component{
		ID:               uuid.New().String(),
		PackageID:        packageID,
		PackageVersionID: versionID,
		Name:             name,
		Type:             cType,
		Path:             path,
	}

	_, err := h.db.Exec(
		`INSERT INTO components (id, package_id, package_version_id, name, type, path)
         VALUES (?, ?, ?, ?, ?, ?)`,
		comp.ID, comp.PackageID, comp.PackageVersionID, comp.Name, comp.Type, comp.Path,
	)
	if err != nil {
		return nil, err
	}
	return comp, nil
}

func (h *Hub) GetComponentsByVersion(versionID string) ([]*types.Component, error) {
	rows, err := h.db.Query(
		`SELECT id, package_id, package_version_id, name, type, path 
         FROM components WHERE package_version_id = ?`,
		versionID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var components []*types.Component
	for rows.Next() {
		c := &types.Component{}
		rows.Scan(&c.ID, &c.PackageID, &c.PackageVersionID, &c.Name, &c.Type, &c.Path)
		components = append(components, c)
	}
	return components, nil
}

func (h *Hub) GetAllComponents(target string) ([]*types.Component, error) {
	query := `
        SELECT c.id, c.package_id, c.package_version_id, c.name, c.type, c.path
        FROM components c
        JOIN packages p ON c.package_id = p.id
        JOIN package_versions pv ON c.package_version_id = pv.id AND pv.is_current = TRUE
    `
	args := []interface{}{}

	if target != "" {
		query += ` WHERE p.target = ?`
		args = append(args, target)
	}

	rows, err := h.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var components []*types.Component
	for rows.Next() {
		c := &types.Component{}
		rows.Scan(&c.ID, &c.PackageID, &c.PackageVersionID, &c.Name, &c.Type, &c.Path)
		components = append(components, c)
	}
	return components, nil
}

// Project management

type Project struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Path      string `json:"path"`
	CreatedAt string `json:"created_at"`
}

func (h *Hub) CreateProject(name, path string) (*Project, error) {
	// Check if project exists
	exists, err := h.ProjectExists(name)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, nil
	}

	proj := &Project{
		ID:   uuid.New().String(),
		Name: name,
		Path: path,
	}

	_, err = h.db.Exec(
		`INSERT INTO projects (id, name, path) VALUES (?, ?, ?)`,
		proj.ID, proj.Name, proj.Path,
	)
	if err != nil {
		return nil, err
	}
	return proj, nil
}

func (h *Hub) ListProjects() ([]*Project, error) {
	rows, err := h.db.Query(`SELECT id, name, path, created_at FROM projects ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []*Project
	for rows.Next() {
		p := &Project{}
		rows.Scan(&p.ID, &p.Name, &p.Path, &p.CreatedAt)
		projects = append(projects, p)
	}
	return projects, nil
}

func (h *Hub) ProjectExists(name string) (bool, error) {
	var count int
	err := h.db.QueryRow(`SELECT COUNT(*) FROM projects WHERE name = ?`, name).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (h *Hub) DeleteProject(name string) error {
	_, err := h.db.Exec(`DELETE FROM projects WHERE name = ?`, name)
	return err
}

func (h *Hub) ValidateProjectPath(path string) (bool, error) {
	info, err := os.Stat(path)
	if err != nil {
		return false, err
	}
	return info.IsDir(), nil
}

func (h *Hub) RecordInstallation(inst *types.Installation) error {
	_, err := h.db.Exec(
		`INSERT INTO installations (id, component_id, ide, scope, install_path) VALUES (?, ?, ?, ?, ?)`,
		inst.ID, inst.ComponentID, inst.IDE, inst.Scope, inst.InstallPath,
	)
	return err
}

func (h *Hub) ListInstallations(ide, scope string) ([]*types.Installation, error) {
	query := `SELECT id, component_id, ide, scope, install_path, installed_at FROM installations WHERE 1=1`
	args := []interface{}{}

	if ide != "" {
		query += ` AND ide = ?`
		args = append(args, ide)
	}
	if scope != "" {
		query += ` AND scope = ?`
		args = append(args, scope)
	}

	rows, err := h.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var installations []*types.Installation
	for rows.Next() {
		inst := &types.Installation{}
		rows.Scan(&inst.ID, &inst.ComponentID, &inst.IDE, &inst.Scope, &inst.InstallPath, &inst.InstalledAt)
		installations = append(installations, inst)
	}
	return installations, nil
}
