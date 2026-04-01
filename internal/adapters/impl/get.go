package impl

import (
	"errors"

	"github.com/easy-skills/easy-skills/internal/adapters"
	"github.com/easy-skills/easy-skills/internal/adapters/cursor"
	"github.com/easy-skills/easy-skills/internal/adapters/qoder"
)

// Get returns an IDEAdapter for the given IDE name
func Get(name string) (adapters.IDEAdapter, error) {
	switch name {
	case "qoder":
		return qoder.New(), nil
	case "cursor":
		return cursor.New(), nil
	default:
		return nil, errors.New("unsupported IDE: " + name)
	}
}
