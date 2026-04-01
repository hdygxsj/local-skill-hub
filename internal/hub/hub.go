package hub

import (
	"os"
	"path/filepath"
)

type Hub struct {
	db *DB
}

func NewHub() (*Hub, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	dir := filepath.Join(home, ".local", "easy-skills")
	db, err := NewDB(dir)
	if err != nil {
		return nil, err
	}

	return &Hub{db: db}, nil
}

func (h *Hub) Close() error {
	return h.db.Close()
}
