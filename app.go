package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

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
