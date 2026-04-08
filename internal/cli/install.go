package cli

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/easy-skills/easy-skills/internal/adapters/impl"
	"github.com/easy-skills/easy-skills/internal/hub"
	"github.com/easy-skills/easy-skills/pkg/types"
	"github.com/google/uuid"
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

	// Clone/fetch source to temp directory
	tmpDir, err := os.MkdirTemp("", "easy-skills-*")
	if err != nil {
		Failf("Failed to create temp dir: %v", err)
		return
	}
	defer os.RemoveAll(tmpDir)

	// Clone from Git URL if source is provided
	if pkg.Source != "" {
		gitCmd := exec.Command("git", "clone", "--depth", "1", pkg.Source, tmpDir)
		gitCmd.Stderr = os.Stderr
		if err := gitCmd.Run(); err != nil {
			Failf("Failed to clone from %s: %v", pkg.Source, err)
			return
		}
	} else {
		Fail("Package has no source URL")
		return
	}

	// Get installation directory
	installDir, err := adapter.GetSkillDir(scope)
	if err != nil {
		Failf("Failed to get install dir: %v", err)
		return
	}

	// Create install directory if not exists
	if err := os.MkdirAll(installDir, 0755); err != nil {
		Failf("Failed to create install dir: %v", err)
		return
	}

	// Install each component
	var installed []string
	for _, comp := range components {
		srcPath := filepath.Join(tmpDir, comp.Path)
		if _, err := os.Stat(srcPath); os.IsNotExist(err) {
			continue
		}

		// Copy files to installation directory
		destPath := filepath.Join(installDir, comp.Name)
		
		// Remove existing if present
		os.RemoveAll(destPath)
		
		if err := copyDir(srcPath, destPath); err != nil {
			Failf("Failed to install %s: %v", comp.Name, err)
			return
		}

		// Record installation in database
		inst := &types.Installation{
			ID:          uuid.New().String(),
			ComponentID: comp.ID,
			IDE:         ide,
			Scope:       scope,
			InstallPath: destPath,
		}
		if err := h.RecordInstallation(inst); err != nil {
			Failf("Failed to record installation: %v", err)
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

// copyDir copies a directory recursively using io.Copy
func copyDir(src, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		relPath, _ := filepath.Rel(src, path)
		destPath := filepath.Join(dst, relPath)
		if info.IsDir() {
			return os.MkdirAll(destPath, info.Mode())
		}
		// Copy file
		srcFile, err := os.Open(path)
		if err != nil {
			return err
		}
		defer srcFile.Close()
		dstFile, err := os.Create(destPath)
		if err != nil {
			return err
		}
		defer dstFile.Close()
		_, err = dstFile.ReadFrom(srcFile)
		return err
	})
}
