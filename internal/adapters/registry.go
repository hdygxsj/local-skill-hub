package adapters

import (
	"fmt"

	"github.com/easy-skills/easy-skills/internal/adapters/cursor"
	"github.com/easy-skills/easy-skills/internal/adapters/qoder"
)

var registry = make(map[string]IDEAdapter)

func Register(adapter IDEAdapter) {
	registry[adapter.Name()] = adapter
}

func Get(name string) (IDEAdapter, error) {
	adapter, ok := registry[name]
	if !ok {
		return nil, fmt.Errorf("adapter not found: %s", name)
	}
	return adapter, nil
}

func List() []IDEAdapter {
	var adapters []IDEAdapter
	for _, adapter := range registry {
		adapters = append(adapters, adapter)
	}
	return adapters
}

func init() {
	Register(qoder.NewQoderAdapter())
	Register(cursor.NewCursorAdapter())
}
