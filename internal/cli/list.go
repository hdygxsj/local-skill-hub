package cli

import (
	"encoding/json"
	"os"

	"github.com/easy-skills/easy-skills/internal/hub"
	"github.com/spf13/cobra"
)

var listJSON bool

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List packages in Hub",
	Long:  "List all packages in the local Hub, optionally filtered by target",
	Run:   runList,
}

func init() {
	rootCmd.AddCommand(listCmd)
	listCmd.Flags().StringVar(&flagTarget, "target", "", "Filter by target (qoder/cursor)")
	listCmd.Flags().BoolVar(&listJSON, "json", false, "Output as JSON")
}

func runList(cmd *cobra.Command, args []string) {
	h, err := hub.NewHub()
	if err != nil {
		Failf("Failed to create hub: %v", err)
		return
	}
	defer h.Close()

	packages, err := h.ListPackages(flagTarget)
	if err != nil {
		Failf("Failed to list packages: %v", err)
		return
	}

	// Enrich with version info
	var result []map[string]interface{}
	for _, pkg := range packages {
		version, _ := h.GetCurrentVersion(pkg.ID)
		components, _ := h.GetComponentsByVersion(version.ID)

		result = append(result, map[string]interface{}{
			"package":          pkg,
			"current_version":  version,
			"components":       components,
			"components_count": len(components),
		})
	}

	if listJSON {
		// Raw JSON output for API
		json.NewEncoder(os.Stdout).Encode(map[string]interface{}{
			"packages": result,
			"count":    len(result),
		})
	} else {
		Success(map[string]interface{}{
			"packages": result,
			"count":    len(result),
		})
	}
}
