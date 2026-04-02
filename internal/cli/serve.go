package cli

import (
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"strconv"
	"syscall"

	"github.com/spf13/cobra"
)

var servePort string
var serveDev bool

// getPidFilePath returns the path to the PID file
func getPidFilePath() (string, error) {
	usr, err := user.Current()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(usr.HomeDir, ".easy-skills")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", err
	}
	return filepath.Join(dir, "easy-skills.pid"), nil
}

// writePidFile writes the current process PID to file
func writePidFile() error {
	pidPath, err := getPidFilePath()
	if err != nil {
		return fmt.Errorf("failed to get PID file path: %w", err)
	}
	pid := os.Getpid()
	return os.WriteFile(pidPath, []byte(strconv.Itoa(pid)), 0644)
}

// readPidFile reads the PID from file
func readPidFile() (int, error) {
	pidPath, err := getPidFilePath()
	if err != nil {
		return 0, err
	}
	data, err := os.ReadFile(pidPath)
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(string(data))
}

// removePidFile removes the PID file
func removePidFile() error {
	pidPath, err := getPidFilePath()
	if err != nil {
		return err
	}
	os.Remove(pidPath)
	return nil
}

// isProcessRunning checks if a process with given PID is running
func isProcessRunning(pid int) bool {
	process, err := os.FindProcess(pid)
	if err != nil {
		return false
	}
	// Send signal 0 to check if process exists
	err = process.Signal(syscall.Signal(0))
	return err == nil
}

// stopProcess gracefully stops a process by PID
func stopProcess(pid int) error {
	process, err := os.FindProcess(pid)
	if err != nil {
		return fmt.Errorf("failed to find process: %w", err)
	}
	// Try graceful termination first
	if err := process.Signal(syscall.SIGTERM); err != nil {
		return fmt.Errorf("failed to send SIGTERM: %w", err)
	}
	// Wait for process to exit (max 5 seconds)
	for i := 0; i < 50; i++ {
		if !isProcessRunning(pid) {
			return nil
		}
	}
	// Force kill if still running
	if err := process.Kill(); err != nil {
		return fmt.Errorf("failed to kill process: %w", err)
	}
	return nil
}

// getCurrentExecutable returns the path to the current executable
func getCurrentExecutable() (string, error) {
	execPath, err := os.Executable()
	if err != nil {
		return "", err
	}
	// Resolve symlinks
	realPath, err := filepath.EvalSymlinks(execPath)
	if err != nil {
		return execPath, nil
	}
	return realPath, nil
}

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Start the Easy Skills Hub web server",
	Long:  "Start a local HTTP server that serves the web GUI",
	Run:   runServe,
}

var restartCmd = &cobra.Command{
	Use:   "restart",
	Short: "Restart the Easy Skills Hub server",
	Long:  "Stop the running server and start it again with the same parameters",
	Run:   runRestart,
}

func init() {
	rootCmd.AddCommand(serveCmd)
	serveCmd.Flags().StringVar(&servePort, "port", "27842", "Port to listen on")
	serveCmd.Flags().BoolVar(&serveDev, "dev", false, "Run in development mode with hot reload")

	rootCmd.AddCommand(restartCmd)
	restartCmd.Flags().StringVar(&servePort, "port", "27842", "Port to listen on")
	restartCmd.Flags().BoolVar(&serveDev, "dev", false, "Run in development mode with hot reload")
}

func runRestart(cmd *cobra.Command, args []string) {
	// Try to read existing PID and stop the process
	pid, err := readPidFile()
	if err != nil {
		// No PID file, just start fresh
		fmt.Println("No running server found, starting a new one...")
	} else if isProcessRunning(pid) {
		fmt.Printf("Stopping server (PID: %d)...\n", pid)
		if err := stopProcess(pid); err != nil {
			Failf("Failed to stop server: %v", err)
			os.Exit(1)
		}
		fmt.Println("Server stopped.")
	} else {
		fmt.Println("Server not running, cleaning up stale PID file...")
		removePidFile()
	}

	// Wait a moment for port to be released
	fmt.Println("Starting server...")

	// Get current executable path
	execPath, err := getCurrentExecutable()
	if err != nil {
		execPath = os.Args[0]
	}

	// Build arguments for new server
	newArgs := []string{"serve"}
	if servePort != "27842" {
		newArgs = append(newArgs, "--port", servePort)
	}
	if serveDev {
		newArgs = append(newArgs, "--dev")
	}

	// Start new server process
	newProcess := exec.Command(execPath, newArgs...)
	newProcess.Stdout = os.Stdout
	newProcess.Stderr = os.Stderr
	newProcess.Stdin = os.Stdin

	if err := newProcess.Start(); err != nil {
		Failf("Failed to start server: %v", err)
		os.Exit(1)
	}

	fmt.Printf("Server restarting (new PID: %d)...\n", newProcess.Process.Pid)
}

func runServe(cmd *cobra.Command, args []string) {
	// Development mode - run npm dev server
	if serveDev {
		runNpmDev()
		return
	}

	// Check if port is available
	addr := fmt.Sprintf(":%s", servePort)
	if !isPortAvailable(addr) {
		Failf("Port %s is already in use. Please stop the existing process or use a different port.", servePort)
		os.Exit(1)
	}

	// Write PID file
	if err := writePidFile(); err != nil {
		Failf("Failed to write PID file: %v", err)
		os.Exit(1)
	}

	// Clean up PID file on exit
	defer removePidFile()

	// Production mode - use embedded web UI
	http.Handle("/", ServeFileServer())

	// API proxy - call CLI commands
	http.HandleFunc("/api/packages", handlePackages)
	http.HandleFunc("/api/projects", handleProjects)

	fmt.Printf("Easy Skills Hub running at http://localhost:%s\n", servePort)
	fmt.Printf("PID: %d\n", os.Getpid())
	fmt.Printf("Press Ctrl+C to stop\n")

	if err := http.ListenAndServe(addr, nil); err != nil {
		Failf("Server error: %v", err)
	}
}

// isPortAvailable checks if the given address (e.g., ":27842") is available
func isPortAvailable(addr string) bool {
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return false
	}
	listener.Close()
	return true
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
