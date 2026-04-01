package hub

import (
	"time"

	"github.com/easy-skills/easy-skills/pkg/types"
	"github.com/google/uuid"
)

func (h *Hub) CreateVersion(packageID string, version int64, metadata string) (*types.PackageVersion, error) {
	pv := &types.PackageVersion{
		ID:        uuid.New().String(),
		PackageID: packageID,
		Version:   version,
		Metadata:  metadata,
		IsCurrent: true,
		CreatedAt: time.Now(),
	}

	// Set all other versions to non-current
	h.db.Exec(`UPDATE package_versions SET is_current = FALSE WHERE package_id = ?`, packageID)

	_, err := h.db.Exec(
		`INSERT INTO package_versions (id, package_id, version, metadata, is_current, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
		pv.ID, pv.PackageID, pv.Version, pv.Metadata, pv.IsCurrent, pv.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return pv, nil
}

func (h *Hub) GetCurrentVersion(packageID string) (*types.PackageVersion, error) {
	pv := &types.PackageVersion{}
	err := h.db.QueryRow(
		`SELECT id, package_id, version, metadata, is_current, created_at 
         FROM package_versions WHERE package_id = ? AND is_current = TRUE`,
		packageID,
	).Scan(&pv.ID, &pv.PackageID, &pv.Version, &pv.Metadata, &pv.IsCurrent, &pv.CreatedAt)
	if err != nil {
		return nil, err
	}
	return pv, nil
}

func (h *Hub) ListVersions(packageID string) ([]*types.PackageVersion, error) {
	rows, err := h.db.Query(
		`SELECT id, package_id, version, metadata, is_current, created_at 
         FROM package_versions WHERE package_id = ? ORDER BY version DESC`,
		packageID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var versions []*types.PackageVersion
	for rows.Next() {
		pv := &types.PackageVersion{}
		rows.Scan(&pv.ID, &pv.PackageID, &pv.Version, &pv.Metadata, &pv.IsCurrent, &pv.CreatedAt)
		versions = append(versions, pv)
	}
	return versions, nil
}
