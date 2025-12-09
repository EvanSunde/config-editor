package main

// Config represents the root of your TOML file
type Config struct {
	Device    DeviceInfo          `toml:"device" json:"device"`
	Hypr      HyprSettings        `toml:"hypr" json:"hypr"`
	Zones     map[string][]string `toml:"zones" json:"zones"`
	Presets   map[string]Preset   `toml:"presets" json:"presets"`
	Profiles  map[string]Profile  `toml:"profiles" json:"profiles"`
	Apps      AppConfig           `toml:"apps" json:"apps"`
	Shortcuts map[string]Shortcut `toml:"shortcuts" json:"shortcuts"`
}

type DeviceInfo struct {
	Name         string `toml:"name" json:"name"`
	PacketHeader []int  `toml:"packet_header" json:"packet_header"`
	Layout       string `toml:"layout" json:"layout"`
	// ... add other device fields if you need them editable
}

type HyprSettings struct {
	Enabled                bool   `toml:"enabled" json:"enabled"`
	ShortcutsOverlayPreset string `toml:"shortcuts_overlay_preset" json:"shortcuts_overlay_preset"`
}

// Preset is the "Super Struct" handling all effect types
type Preset struct {
	Type string `toml:"type" json:"type"`

	// Color Properties
	Color      string   `toml:"color,omitempty" json:"color,omitempty"`
	Colors     []string `toml:"colors,omitempty" json:"colors,omitempty"`
	Background string   `toml:"background,omitempty" json:"background,omitempty"`
	Tint       string   `toml:"tint,omitempty" json:"tint,omitempty"`
	TintMix    float64  `toml:"tint_mix,omitempty" json:"tint_mix,omitempty"`

	// Physics / Animation Properties
	Speed          float64 `toml:"speed,omitempty" json:"speed,omitempty"`
	Scale          float64 `toml:"scale,omitempty" json:"scale,omitempty"`
	Density        float64 `toml:"density,omitempty" json:"density,omitempty"`
	WaveComplexity int     `toml:"wave_complexity,omitempty" json:"wave_complexity,omitempty"`

	// Reaction Diffusion Specifics
	Du   float64 `toml:"du,omitempty" json:"du,omitempty"`
	Dv   float64 `toml:"dv,omitempty" json:"dv,omitempty"`
	Feed float64 `toml:"feed,omitempty" json:"feed,omitempty"`
	Kill float64 `toml:"kill,omitempty" json:"kill,omitempty"`

	// Reactive Properties
	Reactive             bool    `toml:"reactive,omitempty" json:"reactive,omitempty"`
	ReactiveDisplacement float64 `toml:"reactive_displacement,omitempty" json:"reactive_displacement,omitempty"`
	ReactivePush         bool    `toml:"reactive_push,omitempty" json:"reactive_push,omitempty"`
}

type Profile struct {
	Layers []Layer `toml:"layers" json:"layers"`
}

type Layer struct {
	PresetName string   `toml:"preset" json:"preset"`
	Zones      []string `toml:"zones,omitempty" json:"zones,omitempty"`
	Keys       []string `toml:"keys,omitempty" json:"keys,omitempty"`
}

type AppConfig struct {
	DefaultProfile  string                 `toml:"default_profile" json:"default_profile"`
	DefaultShortcut string                 `toml:"default_shortcut" json:"default_shortcut"`
	Mappings        map[string]interface{} `toml:"mappings" json:"mappings"` // Interface needed because mappings can be string OR object
}

type Shortcut struct {
	Color     string   `toml:"color,omitempty" json:"color,omitempty"`
	Ctrl      []string `toml:"ctrl,omitempty" json:"ctrl,omitempty"`
	Shift     []string `toml:"shift,omitempty" json:"shift,omitempty"`
	Alt       []string `toml:"alt,omitempty" json:"alt,omitempty"`
	Win       []string `toml:"win,omitempty" json:"win,omitempty"`
	CtrlShift []string `toml:"ctrl_shift,omitempty" json:"ctrl_shift,omitempty"`
	// ... add other combos as needed
}
