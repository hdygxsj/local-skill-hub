package cli

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"

	"github.com/spf13/cobra"
)

var servePort string
var serveDev bool

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Start the Easy Skills Hub web server",
	Long:  "Start a local HTTP server that serves the web GUI",
	Run:   runServe,
}

func init() {
	rootCmd.AddCommand(serveCmd)
	serveCmd.Flags().StringVar(&servePort, "port", "27842", "Port to listen on")
	serveCmd.Flags().BoolVar(&serveDev, "dev", false, "Run in development mode with hot reload")
}

func runServe(cmd *cobra.Command, args []string) {
	// Development mode - run npm dev server
	if serveDev {
		runNpmDev()
		return
	}

	// Production mode - use embedded web UI
	http.Handle("/", ServeFileServer())

	// API proxy - call CLI commands
	http.HandleFunc("/api/packages", handlePackages)
	http.HandleFunc("/api/projects", handleProjects)

	addr := fmt.Sprintf(":%s", servePort)
	fmt.Printf("Easy Skills Hub running at http://localhost:%s\n", servePort)
	fmt.Printf("Press Ctrl+C to stop\n")

	if err := http.ListenAndServe(addr, nil); err != nil {
		Failf("Server error: %v", err)
	}
}

func runNpmDev() {
	// Find web directory
	execPath, err := os.Executable()
	if err != nil {
		execPath = os.Args[0]
	}

	webDir := execPath[:len(execPath)-len("easy-skills")] + "web"

	cmd := exec.Command("npm", "run", "dev")
	cmd.Dir = webDir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		Failf("Failed to start dev server: %v", err)
	}
}

func handlePackages(w http.ResponseWriter, r *http.Request) {
	target := r.URL.Query().Get("target")

	// Call CLI list command
	args := []string{"list", "--target", target, "--json"}
	if target == "" {
		args = []string{"list", "--json"}
	}

	output, err := exec.Command(os.Args[0], args...).Output()
	if err != nil {
		http.Error(w, fmt.Sprintf("CLI error: %v", err), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)
}

func handleProjects(w http.ResponseWriter, r *http.Request) {
	// Return list of projects with .qoder directory
	// This could be enhanced to read from filesystem or config
	projects := []map[string]string{
		{"name": "local-skill-hub", "path": "/Users/zhongyangyang/PycharmProjects/local-skill-hub"},
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprint(w, `{"projects":[`)
	for i, p := range projects {
		if i > 0 {
			fmt.Fprint(w, ",")
		}
		fmt.Fprintf(w, `{"name":"%s","path":"%s"}`, p["name"], p["path"])
	}
	fmt.Fprint(w, `]}`)
}
