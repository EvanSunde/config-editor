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

// Helper: Get the base config directory (~/.config/Redragon)
func (a *App) getConfigDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".config", "Redragon"), nil
}

// KeyLayout matches the CSV structure for the frontend
type KeyLayout struct {
	Label string  `json:"label"`
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
	W     float64 `json:"w"`
	H     float64 `json:"h"`
}

// LoadConfig reads the TOML file and returns the struct to the Frontend
func (a *App) LoadConfig() (Config, error) {
	var config Config

	dir, err := a.getConfigDir()
	if err != nil {
		return config, fmt.Errorf("could not get config dir: %w", err)
	}

	path := filepath.Join(dir, "config.toml")

	// Read file content
	data, err := os.ReadFile(path)
	if err != nil {
		return config, fmt.Errorf("could not read file at %s: %w", path, err)
	}

	// Parse TOML
	if _, err := toml.Decode(string(data), &config); err != nil {
		return config, fmt.Errorf("could not parse TOML: %w", err)
	}

	return config, nil
}

// SaveConfig takes the updated struct from Frontend and writes it back to disk
func (a *App) SaveConfig(config Config) error {
	dir, err := a.getConfigDir()
	if err != nil {
		return fmt.Errorf("could not get config dir: %w", err)
	}

	path := filepath.Join(dir, "config.toml")

	// Prune unrelated effect fields so layers only persist fields for their active type
	if config.Profiles != nil {
		for name, prof := range config.Profiles {
			if len(prof.Layers) > 0 {
				for i := range prof.Layers {
					t := prof.Layers[i].InflateFromFlat()
					prof.Layers[i].FlattenToFlat(t)
				}
			}
			config.Profiles[name] = prof
		}
	}

	f, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("could not open file for writing: %w", err)
	}
	defer f.Close()

	encoder := toml.NewEncoder(f)
	// Optionally indent if your library supports it, otherwise default encoding
	if err := encoder.Encode(config); err != nil {
		return fmt.Errorf("could not encode TOML: %w", err)
	}

	return nil
}

// LoadLayout reads the CSV layout file specified in the config
func (a *App) LoadLayout(csvFilename string) ([]KeyLayout, error) {
	dir, err := a.getConfigDir()
	if err != nil {
		return nil, err
	}

	path := filepath.Join(dir, csvFilename)
	f, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("layout file not found: %w", err)
	}
	defer f.Close()

	var keys []KeyLayout
	reader := csv.NewReader(f)
	reader.FieldsPerRecord = -1
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("CSV parse error: %w", err)
	}

	// Check if Matrix (starts with Esc/F1) or Coordinate (starts with Label)
	isMatrix := len(records) > 0 && records[0][0] != "Label"

	if isMatrix {
		fmt.Println("DEBUG: Detected Vertical Matrix. Transposing...")
		for colIndex, row := range records { // CSV Rows are physical Columns (X)
			for rowIndex, label := range row { // CSV Items are physical Rows (Y)

				// Safe check for NAN or empty strings
				if label == "NAN" || label == "" || label == "nan" {
					continue
				}

				// SWAP LOGIC:
				// X = colIndex (The row in CSV)
				// Y = rowIndex (The position in that row)
				keys = append(keys, KeyLayout{
					Label: label,
					X:     float64(colIndex),
					Y:     float64(rowIndex),
					W:     1,
					H:     1,
				})
			}
		}
	} else {
		// Standard Coordinate Mode (Label, X, Y, W)
		for i, row := range records {
			if i == 0 || len(row) < 4 {
				continue
			}
			// Helper function safeParseFloat (ensure you have this from previous step)
			keys = append(keys, KeyLayout{
				Label: row[0],
				X:     safeParseFloat(row[1]),
				Y:     safeParseFloat(row[2]),
				W:     safeParseFloat(row[3]),
				H:     1,
			})
		}
	}

	return keys, nil
}

// Make sure you have this helper at the bottom of app.go
func safeParseFloat(s string) float64 {
	if s == "NAN" || s == "nan" || s == "" {
		return 0
	}
	val, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0
	}
	return val
}
