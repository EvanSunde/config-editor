package main

// Config represents the root of your TOML file
type Config struct {
	Device    DeviceInfo          `toml:"device" json:"device"`
	Hypr      HyprSettings        `toml:"hypr" json:"hypr"`
	Zones     map[string][]string `toml:"zones" json:"zones"`
	Profiles  map[string]Profile  `toml:"profiles" json:"profiles"`
	Apps      AppConfig           `toml:"apps" json:"apps"`
	Shortcuts map[string]Shortcut `toml:"shortcuts" json:"shortcuts"`
}

type DeviceInfo struct {
	Name               string `toml:"name" json:"name"`
	VendorID           int    `toml:"vendor_id" json:"vendor_id"`
	ProductID          int    `toml:"product_id" json:"product_id"`
	PacketHeader       []int  `toml:"packet_header" json:"packet_header"`
	PacketLength       int    `toml:"packet_length" json:"packet_length"`
	Layout             string `toml:"layout" json:"layout"`
	Keycodes           string `toml:"keycodes" json:"keycodes"`
	InterfaceUsagePage int    `toml:"interface_usage_page" json:"interface_usage_page"`
	InterfaceUsage     int    `toml:"interface_usage" json:"interface_usage"`
	Transport          string `toml:"transport" json:"transport"`
	FrameIntervalMS    int    `toml:"frame_interval_ms" json:"frame_interval_ms"`
}

type HyprSettings struct {
	Enabled                bool   `toml:"enabled" json:"enabled"`
	ShortcutsOverlayEffect Effect `toml:"shortcuts_overlay_effect" json:"shortcuts_overlay_effect"`
}

// Effect describes any visual effect configuration block
type Effect struct {
	Type string `toml:"type" json:"type"`

	// Color Properties
	Color      string   `toml:"color,omitempty" json:"color,omitempty"`
	Colors     []string `toml:"colors,omitempty" json:"colors,omitempty"`
	Background string   `toml:"background,omitempty" json:"background,omitempty"`
	BaseColor  string   `toml:"base_color,omitempty" json:"base_color,omitempty"`
	Star       string   `toml:"star,omitempty" json:"star,omitempty"`
	Tint       string   `toml:"tint,omitempty" json:"tint,omitempty"`
	TintMix    float64  `toml:"tint_mix,omitempty" json:"tint_mix,omitempty"`
	ColorLow   string   `toml:"color_low,omitempty" json:"color_low,omitempty"`
	ColorHigh  string   `toml:"color_high,omitempty" json:"color_high,omitempty"`

	// Physics / Animation Properties
	Speed          float64 `toml:"speed,omitempty" json:"speed,omitempty"`
	Scale          float64 `toml:"scale,omitempty" json:"scale,omitempty"`
	Density        float64 `toml:"density,omitempty" json:"density,omitempty"`
	WaveComplexity int     `toml:"wave_complexity,omitempty" json:"wave_complexity,omitempty"`
	MixMode        string  `toml:"mix_mode,omitempty" json:"mix_mode,omitempty"`
	Octaves        int     `toml:"octaves,omitempty" json:"octaves,omitempty"`
	Persistence    float64 `toml:"persistence,omitempty" json:"persistence,omitempty"`
	Lacunarity     float64 `toml:"lacunarity,omitempty" json:"lacunarity,omitempty"`
	DriftX         float64 `toml:"drift_x,omitempty" json:"drift_x,omitempty"`
	DriftY         float64 `toml:"drift_y,omitempty" json:"drift_y,omitempty"`
	Contrast       float64 `toml:"contrast,omitempty" json:"contrast,omitempty"`
	WaveSpeed      float64 `toml:"wave_speed,omitempty" json:"wave_speed,omitempty"`
	DecayTime      float64 `toml:"decay_time,omitempty" json:"decay_time,omitempty"`
	Thickness      float64 `toml:"thickness,omitempty" json:"thickness,omitempty"`
	Intensity      float64 `toml:"intensity,omitempty" json:"intensity,omitempty"`
	History        float64 `toml:"history,omitempty" json:"history,omitempty"`
	Cooling        float64 `toml:"cooling,omitempty" json:"cooling,omitempty"`
	SparkChance    float64 `toml:"spark_chance,omitempty" json:"spark_chance,omitempty"`
	SparkIntensity float64 `toml:"spark_intensity,omitempty" json:"spark_intensity,omitempty"`

	// Reaction Diffusion Specifics
	Du     float64 `toml:"du,omitempty" json:"du,omitempty"`
	Dv     float64 `toml:"dv,omitempty" json:"dv,omitempty"`
	Feed   float64 `toml:"feed,omitempty" json:"feed,omitempty"`
	Kill   float64 `toml:"kill,omitempty" json:"kill,omitempty"`
	Width  int     `toml:"width,omitempty" json:"width,omitempty"`
	Height int     `toml:"height,omitempty" json:"height,omitempty"`
	Steps  int     `toml:"steps,omitempty" json:"steps,omitempty"`
	Zoom   float64 `toml:"zoom,omitempty" json:"zoom,omitempty"`

	// Reactive Properties
	Reactive             bool    `toml:"reactive,omitempty" json:"reactive,omitempty"`
	ReactiveDisplacement float64 `toml:"reactive_displacement,omitempty" json:"reactive_displacement,omitempty"`
	ReactivePush         bool    `toml:"reactive_push,omitempty" json:"reactive_push,omitempty"`
	ReactivePhaseShift   float64 `toml:"reactive_phase_shift,omitempty" json:"reactive_phase_shift,omitempty"`
	ReactivePushDuration float64 `toml:"reactive_push_duration,omitempty" json:"reactive_push_duration,omitempty"`

	// Injection / Ripple Extras
	InjectionAmount  float64 `toml:"injection_amount,omitempty" json:"injection_amount,omitempty"`
	InjectionRadius  float64 `toml:"injection_radius,omitempty" json:"injection_radius,omitempty"`
	InjectionDecay   float64 `toml:"injection_decay,omitempty" json:"injection_decay,omitempty"`
	InjectionHistory float64 `toml:"injection_history,omitempty" json:"injection_history,omitempty"`
}

type Profile struct {
	Layers []Layer `toml:"layers" json:"layers"`
}

type Layer struct {
	Effect
	Zones []string `toml:"zones,omitempty" json:"zones,omitempty"`
	Keys  []string `toml:"keys,omitempty" json:"keys,omitempty"`
}

type AppConfig struct {
	DefaultProfile  string                 `toml:"default_profile" json:"default_profile"`
	DefaultShortcut string                 `toml:"default_shortcut" json:"default_shortcut"`
	Mappings        map[string]interface{} `toml:"mappings" json:"mappings"` // Interface needed because mappings can be string OR object
}

type Shortcut struct {
	Color        string   `toml:"color,omitempty" json:"color,omitempty"`
	Ctrl         []string `toml:"ctrl,omitempty" json:"ctrl,omitempty"`
	CtrlAlt      []string `toml:"ctrl_alt,omitempty" json:"ctrl_alt,omitempty"`
	CtrlAltShift []string `toml:"ctrl_alt_shift,omitempty" json:"ctrl_alt_shift,omitempty"`
	CtrlShift    []string `toml:"ctrl_shift,omitempty" json:"ctrl_shift,omitempty"`
	CtrlShiftAlt []string `toml:"ctrl_shift_alt,omitempty" json:"ctrl_shift_alt,omitempty"`

	Shift    []string `toml:"shift,omitempty" json:"shift,omitempty"`
	ShiftAlt []string `toml:"shift_alt,omitempty" json:"shift_alt,omitempty"`

	Alt      []string `toml:"alt,omitempty" json:"alt,omitempty"`
	AltShift []string `toml:"alt_shift,omitempty" json:"alt_shift,omitempty"`
	AltCtrl  []string `toml:"alt_ctrl,omitempty" json:"alt_ctrl,omitempty"`

	Win             []string `toml:"win,omitempty" json:"win,omitempty"`
	WinShift        []string `toml:"win_shift,omitempty" json:"win_shift,omitempty"`
	WinShiftAlt     []string `toml:"win_shift_alt,omitempty" json:"win_shift_alt,omitempty"`
	WinAlt          []string `toml:"win_alt,omitempty" json:"win_alt,omitempty"`
	WinCtrl         []string `toml:"win_ctrl,omitempty" json:"win_ctrl,omitempty"`
	WinCtrlShift    []string `toml:"win_ctrl_shift,omitempty" json:"win_ctrl_shift,omitempty"`
	WinCtrlAlt      []string `toml:"win_ctrl_alt,omitempty" json:"win_ctrl_alt,omitempty"`
	WinCtrlAltShift []string `toml:"win_ctrl_alt_shift,omitempty" json:"win_ctrl_alt_shift,omitempty"`
}
