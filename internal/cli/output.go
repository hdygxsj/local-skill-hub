package cli

import (
	"encoding/json"
	"fmt"
	"os"
)

type Output struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func PrintJSON(v interface{}) {
	enc := json.NewEncoder(os.Stdout)
	enc.SetIndent("", "  ")
	enc.Encode(v)
}

func Success(data interface{}) {
	PrintJSON(Output{Success: true, Data: data})
}

func Fail(err string) {
	PrintJSON(Output{Success: false, Error: err})
}

func Failf(format string, args ...interface{}) {
	Fail(fmt.Sprintf(format, args...))
}
