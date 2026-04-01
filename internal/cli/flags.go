package cli

import "github.com/spf13/cobra"

var (
	flagName   string
	flagTarget string
	flagSource string
	flagIDE    string
	flagScope  string
)

func bindFlags(cmd *cobra.Command) {
	cmd.Flags().StringVar(&flagName, "name", "", "Package name")
	cmd.Flags().StringVar(&flagTarget, "target", "", "Target IDE (qoder/cursor)")
	cmd.Flags().StringVar(&flagSource, "source", "", "Source URL")
	cmd.Flags().StringVar(&flagIDE, "ide", "", "IDE to install to")
	cmd.Flags().StringVar(&flagScope, "scope", "user", "Scope (user/project)")
}
