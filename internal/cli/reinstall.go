package cli

import (
	"github.com/easy-skills/easy-skills/internal/adapters/impl"
	"github.com/spf13/cobra"
)

var reinstallCmd = &cobra.Command{
	Use:   "reinstall",
	Short: "Reinstall a package to IDE",
	Long:  "Uninstall and install a package to the target IDE",
	Run:   runReinstall,
}

func init() {
	rootCmd.AddCommand(reinstallCmd)
	reinstallCmd.Flags().StringVar(&flagName, "name", "", "Package name (required)")
	reinstallCmd.Flags().StringVar(&flagTarget, "target", "", "Target IDE: qoder or cursor (required)")
	reinstallCmd.Flags().StringVar(&flagIDE, "ide", "", "IDE to reinstall to (qoder/cursor)")
	reinstallCmd.Flags().StringVar(&installScope, "scope", "user", "Installation scope: user or project")
	reinstallCmd.MarkFlagRequired("name")
	reinstallCmd.MarkFlagRequired("target")
}

func runReinstall(cmd *cobra.Command, args []string) {
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

	// Get installed path
	path, err := adapter.GetInstalledPath(pkgName, scope)
	if err != nil {
		Failf("Failed to get path: %v", err)
		return
	}

	// Uninstall first (ignore error if not installed)
	adapter.UninstallComponent(pkgName, path)

	// Re-run install with same flags
	flagName = pkgName
	flagTarget = target
	flagIDE = ide
	installScope = scope
	runInstall(cmd, args)
}
