package hub

import (
	"database/sql"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

// DB wraps sql.DB with hub-specific functionality
type DB struct {
	*sql.DB
}

// NewDB creates a new database connection and runs migrations
func NewDB(homeDir string) (*DB, error) {
	dbPath := filepath.Join(homeDir, "hub.db")
	if err := os.MkdirAll(homeDir, 0755); err != nil {
		return nil, err
	}

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	h := &DB{db}
	if err := h.migrate(); err != nil {
		return nil, err
	}

	return h, nil
}

// migrate creates the database schema
func (h *DB) migrate() error {
	schema := `
	CREATE TABLE IF NOT EXISTS packages (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		target TEXT NOT NULL,
		source TEXT,
		metadata TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(name, target)
	);

	CREATE TABLE IF NOT EXISTS package_versions (
		id TEXT PRIMARY KEY,
		package_id TEXT REFERENCES packages(id),
		version INTEGER NOT NULL,
		metadata TEXT,
		is_current BOOLEAN DEFAULT FALSE,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS components (
		id TEXT PRIMARY KEY,
		package_id TEXT REFERENCES packages(id),
		package_version_id TEXT REFERENCES package_versions(id),
		name TEXT NOT NULL,
		type TEXT NOT NULL,
		path TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS installations (
		id TEXT PRIMARY KEY,
		component_id TEXT REFERENCES components(id),
		ide TEXT NOT NULL,
		scope TEXT NOT NULL,
		install_path TEXT NOT NULL,
		installed_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := h.Exec(schema)
	return err
}
