package cli

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/easy-skills/easy-skills/internal/adapters/impl"
	"github.com/easy-skills/easy-skills/internal/hub"
	"github.com/spf13/cobra"
)

var installScope string

var installCmd = &cobra.Command{
	Use:   "install",
	Short: "Install a package to IDE",
	Long:  "Install a package's components to the target IDE",
	Run:   runInstall,
}

func init() {
	rootCmd.AddCommand(installCmd)
	installCmd.Flags().StringVar(&flagName, "name", "", "Package name (required)")
	installCmd.Flags().StringVar(&flagTarget, "target", "", "Target IDE: qoder or cursor (required)")
	installCmd.Flags().StringVar(&flagIDE, "ide", "", "IDE to install to (qoder/cursor)")
	installCmd.Flags().StringVar(&installScope, "scope", "user", "Installation scope: user or project")
	installCmd.MarkFlagRequired("name")
	installCmd.MarkFlagRequired("target")
}

func runInstall(cmd *cobra.Command, args []string) {
	pkgName := flagName
	target := flagTarget
	ide := flagIDE
	if ide == "" {
		ide = target
	}
	scope := installScope

	// Get IDE adapter
	adapter, err := impl.Get(ide)
	if err != nil {
		Failf("Unsupported IDE: %s", ide)
		return
	}

	// Get package from Hub
	h, err := hub.NewHub()
	if err != nil {
		Failf("Failed to create hub: %v", err)
		return
	}
	defer h.Close()

	pkg, err := h.GetPackage(pkgName, target)
	if err != nil {
		Failf("Package not found: %s/%s", pkgName, target)
		return
	}

	// Get current version
	version, err := h.GetCurrentVersion(pkg.ID)
	if err != nil {
		Failf("Failed to get version: %v", err)
		return
	}

	// Get components
	components, err := h.GetComponentsByVersion(version.ID)
	if err != nil {
		Failf("Failed to get components: %v", err)
		return
	}

	if len(components) == 0 {
		Fail("Package has no components to install")
		return
	}

	// Get source path from package
	srcDir := getPackageSourceDir(pkg.Source, pkgName)
	if srcDir == "" {
		Fail("Package source not available")
		return
	}

	// Install each component
	var installed []string
	for _, comp := range components {
		srcPath := filepath.Join(srcDir, comp.Path)
		if _, err := os.Stat(srcPath); os.IsNotExist(err) {
			continue
		}

		if err := adapter.InstallComponent(srcPath, comp.Name); err != nil {
			Failf("Failed to install %s: %v", comp.Name, err)
			return
		}
		installed = append(installed, comp.Name)
	}

	Success(map[string]interface{}{
		"package":    pkg,
		"components": installed,
		"scope":      scope,
		"ide":        ide,
		"message":    fmt.Sprintf("Installed %d component(s)", len(installed)),
	})
}

// getPackageSourceDir resolves the source directory for a package
func getPackageSourceDir(source, pkgName string) string {
	if source == "" {
		return ""
	}
	// For Git URLs, this would clone/fetch; for now return empty
	// Actual implementation would download from source
	return ""
}
