package types

import "time"

// Package represents a skill package in the hub
type Package struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Target    string    `json:"target"` // "qoder" / "cursor"
	Source    string    `json:"source,omitempty"`
	Metadata  string    `json:"metadata,omitempty"` // JSON
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// PackageVersion represents a version of a package
type PackageVersion struct {
	ID            string    `json:"id"`
	PackageID     string    `json:"package_id"`
	Version       int64     `json:"version"` // Hub internal version (timestamp)
	Metadata      string    `json:"metadata,omitempty"` // JSON: real version, git ref
	IsCurrent     bool      `json:"is_current"`
	CreatedAt     time.Time `json:"created_at"`
}

// Component represents a skill/agent/hook/rule in a package
type Component struct {
	ID               string `json:"id"`
	PackageID        string `json:"package_id"`
	PackageVersionID string `json:"package_version_id"`
	Name             string `json:"name"`
	Type             string `json:"type"` // "skill" / "agent" / "hook" / "rule"
	Path             string `json:"path"`
}

// Installation represents an installed component
type Installation struct {
	ID          string    `json:"id"`
	ComponentID string    `json:"component_id"`
	IDE         string    `json:"ide"` // "qoder" / "cursor"
	Scope       string    `json:"scope"` // "user" / "project"
	InstallPath string    `json:"install_path"`
	InstalledAt time.Time `json:"installed_at"`
}
