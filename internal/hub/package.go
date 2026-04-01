package hub

import (
	"time"

	"github.com/easy-skills/easy-skills/pkg/types"
	"github.com/google/uuid"
)

func (h *Hub) CreatePackage(name, target, source, metadata string) (*types.Package, error) {
	now := time.Now()
	pkg := &types.Package{
		ID:        uuid.New().String(),
		Name:      name,
		Target:    target,
		Source:    source,
		Metadata:  metadata,
		CreatedAt: now,
		UpdatedAt: now,
	}

	_, err := h.db.Exec(
		`INSERT INTO packages (id, name, target, source, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
		pkg.ID, pkg.Name, pkg.Target, pkg.Source, pkg.Metadata, pkg.CreatedAt, pkg.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return pkg, nil
}

func (h *Hub) GetPackage(name, target string) (*types.Package, error) {
	pkg := &types.Package{}
	err := h.db.QueryRow(
		`SELECT id, name, target, source, metadata, created_at, updated_at 
         FROM packages WHERE name = ? AND target = ?`,
		name, target,
	).Scan(&pkg.ID, &pkg.Name, &pkg.Target, &pkg.Source, &pkg.Metadata, &pkg.CreatedAt, &pkg.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return pkg, nil
}

func (h *Hub) ListPackages(target string) ([]*types.Package, error) {
	query := `SELECT id, name, target, source, metadata, created_at, updated_at FROM packages`
	args := []interface{}{}

	if target != "" {
		query += ` WHERE target = ?`
		args = append(args, target)
	}
	query += ` ORDER BY name`

	rows, err := h.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var packages []*types.Package
	for rows.Next() {
		pkg := &types.Package{}
		rows.Scan(&pkg.ID, &pkg.Name, &pkg.Target, &pkg.Source, &pkg.Metadata, &pkg.CreatedAt, &pkg.UpdatedAt)
		packages = append(packages, pkg)
	}
	return packages, nil
}

func (h *Hub) PackageExists(name, target string) (bool, error) {
	var count int
	err := h.db.QueryRow(
		`SELECT COUNT(*) FROM packages WHERE name = ? AND target = ?`,
		name, target,
	).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
