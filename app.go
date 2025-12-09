package main

import (
	"context"
	"encoding/csv"
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	"github.com/BurntSushi/toml"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// getConfigPath helper to find the file
func (a *App) getConfigPath() string {
	home, _ := os.UserHomeDir()
	// Adjust this path to match your Linux system
	return filepath.Join(home, ".config", "Redragon", "config.toml")
}

// LoadConfig reads the TOML file and returns the struct to the Frontend
func (a *App) LoadConfig() (Config, error) {
	var config Config
	path := a.getConfigPath()

	data, err := os.ReadFile(path)
	if err != nil {
		return config, fmt.Errorf("could not read file: %w", err)
	}

	if _, err := toml.Decode(string(data), &config); err != nil {
		return config, fmt.Errorf("could not parse TOML: %w", err)
	}

	return config, nil
}

// SaveConfig takes the updated struct from Frontend and writes it back to disk
func (a *App) SaveConfig(config Config) error {
	path := a.getConfigPath()

	f, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("could not open file for writing: %w", err)
	}
	defer f.Close()

	encoder := toml.NewEncoder(f)
	if err := encoder.Encode(config); err != nil {
		return fmt.Errorf("could not encode TOML: %w", err)
	}

	return nil
}

// Add this struct to app.go
type KeyLayout struct {
	Label string  `json:"label"`
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
	W     float64 `json:"w"`
	H     float64 `json:"h"` // Optional, default to 1 if missing
}

// Add this method to the App struct
func (a *App) LoadLayout(csvFilename string) ([]KeyLayout, error) {
	// Construct full path relative to the config folder
	home, _ := os.UserHomeDir()
	path := filepath.Join(home, ".config", "Redragon", csvFilename)

	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("could not open layout file: %w", err)
	}
	defer f.Close()

	var keys []KeyLayout

	// standard CSV reader
	reader := csv.NewReader(f)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("could not parse CSV: %w", err)
	}

	// Assuming CSV format: Label, X, Y, Width
	// Skip header if necessary, or check first row
	for i, row := range records {
		// Simple heuristic to skip header
		if i == 0 && row[0] == "Label" {
			continue
		}

		if len(row) < 4 {
			continue
		}

		x, _ := strconv.ParseFloat(row[1], 64)
		y, _ := strconv.ParseFloat(row[2], 64)
		w, _ := strconv.ParseFloat(row[3], 64)

		keys = append(keys, KeyLayout{
			Label: row[0],
			X:     x,
			Y:     y,
			W:     w,
		})
	}

	return keys, nil
}
