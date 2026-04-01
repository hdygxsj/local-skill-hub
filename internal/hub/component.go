package hub

import (
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
