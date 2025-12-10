package main

// --- Typed per-effect configs (internal use; not serialized) ---
type StaticEffect struct {
	Color string
}

type RainbowWaveEffect struct {
	Speed   float64
	Scale   float64
	Tint    string
	TintMix float64
	Colors  []string
}

type LiquidPlasmaEffect struct {
	Colors         []string
	Speed          float64
	Scale          float64
	WaveComplexity int
	MixMode        string
}

type SmokeEffect struct {
	Speed       float64
	Scale       float64
	Octaves     int
	Persistence float64
	Lacunarity  float64
	DriftX      float64
	DriftY      float64
	Contrast    float64
	ColorLow    string
	ColorHigh   string
}

type StarMatrixEffect struct {
	Star       string
	Background string
	Density    float64
	Speed      float64
}

type DoomFireEffect struct {
	Speed          float64
	Cooling        float64
	SparkChance    float64
	SparkIntensity float64
}

type ReactiveRippleEffect struct {
	Color     string
	BaseColor string
	WaveSpeed float64
	DecayTime float64
	Thickness float64
	Intensity float64
}

type ReactionDiffusionEffect struct {
	ColorA string
	ColorB string
	Du     float64
	Dv     float64
	Feed   float64
	Kill   float64
	Width  int
	Height int
	Steps  int
	Zoom   float64
	Speed  float64

	InjectionAmount  float64
	InjectionRadius  float64
	InjectionDecay   float64
	InjectionHistory float64
}

// Private container so Wails codegen ignores it
// (unexported and not referenced in root structs)
type typedConfig struct {
	Static            *StaticEffect
	RainbowWave       *RainbowWaveEffect
	LiquidPlasma      *LiquidPlasmaEffect
	Smoke             *SmokeEffect
	StarMatrix        *StarMatrixEffect
	DoomFire          *DoomFireEffect
	ReactiveRipple    *ReactiveRippleEffect
	ReactionDiffusion *ReactionDiffusionEffect
}

// InflateFromFlat builds a typedConfig from the current flat fields
func (l *Layer) InflateFromFlat() *typedConfig {
	t := &typedConfig{}
	switch l.Type { // l.Type comes from embedded Effect
	case "static_color":
		t.Static = &StaticEffect{Color: l.Color}
	case "rainbow_wave":
		t.RainbowWave = &RainbowWaveEffect{Speed: l.Speed, Scale: l.Scale, Tint: l.Tint, TintMix: l.TintMix, Colors: l.Colors}
	case "liquid_plasma":
		t.LiquidPlasma = &LiquidPlasmaEffect{Colors: l.Colors, Speed: l.Speed, Scale: l.Scale, WaveComplexity: l.WaveComplexity, MixMode: l.MixMode}
	case "smoke":
		t.Smoke = &SmokeEffect{Speed: l.Speed, Scale: l.Scale, Octaves: l.Octaves, Persistence: l.Persistence, Lacunarity: l.Lacunarity, DriftX: l.DriftX, DriftY: l.DriftY, Contrast: l.Contrast, ColorLow: l.ColorLow, ColorHigh: l.ColorHigh}
	case "star_matrix":
		t.StarMatrix = &StarMatrixEffect{Star: l.Star, Background: l.Background, Density: l.Density, Speed: l.Speed}
	case "doom_fire":
		t.DoomFire = &DoomFireEffect{Speed: l.Speed, Cooling: l.Cooling, SparkChance: l.SparkChance, SparkIntensity: l.SparkIntensity}
	case "reactive_ripple":
		t.ReactiveRipple = &ReactiveRippleEffect{Color: l.Color, BaseColor: l.BaseColor, WaveSpeed: l.WaveSpeed, DecayTime: l.DecayTime, Thickness: l.Thickness, Intensity: l.Intensity}
	case "reaction_diffusion":
		t.ReactionDiffusion = &ReactionDiffusionEffect{
			ColorA: l.ColorA,
			ColorB: l.ColorB,
			Du:     l.Du, Dv: l.Dv, Feed: l.Feed, Kill: l.Kill,
			Width: l.Width, Height: l.Height, Steps: l.Steps, Zoom: l.Zoom, Speed: l.Speed,
			InjectionAmount: l.InjectionAmount, InjectionRadius: l.InjectionRadius, InjectionDecay: l.InjectionDecay, InjectionHistory: l.InjectionHistory,
		}
	}
	return t
}

// clearFlatEffectFields zeroes effect-related flat fields to avoid stale values
func (l *Layer) clearFlatEffectFields() {
	// Colors
	l.Color = ""
	l.Colors = nil
	l.Background = ""
	l.BaseColor = ""
	l.Star = ""
	l.Tint = ""
	l.TintMix = 0
	l.ColorLow = ""
	l.ColorHigh = ""
	// Physics
	l.Speed = 0
	l.Scale = 0
	l.Density = 0
	l.WaveComplexity = 0
	l.MixMode = ""
	l.Octaves = 0
	l.Persistence = 0
	l.Lacunarity = 0
	l.DriftX = 0
	l.DriftY = 0
	l.Contrast = 0
	l.WaveSpeed = 0
	l.DecayTime = 0
	l.Thickness = 0
	l.Intensity = 0
	l.History = 0
	l.Cooling = 0
	l.SparkChance = 0
	l.SparkIntensity = 0
	// RD
	l.Du = 0
	l.Dv = 0
	l.Feed = 0
	l.Kill = 0
	l.Width = 0
	l.Height = 0
	l.Steps = 0
	l.Zoom = 0
	// Reactive
	l.Reactive = false
	l.ReactiveDisplacement = 0
	l.ReactivePush = false
	l.ReactivePhaseShift = 0
	l.ReactivePushDuration = 0
	l.ReactiveColor = ""
	l.ReactiveHistory = 0
	l.ReactiveDecay = 0
	l.ReactiveSpread = 0
	l.ReactiveIntensity = 0
	// Injection
	l.InjectionAmount = 0
	l.InjectionRadius = 0
	l.InjectionDecay = 0
	l.InjectionHistory = 0
}

// FlattenToFlat copies a typedConfig back into the flat fields for serialization
func (l *Layer) FlattenToFlat(t *typedConfig) {
	if t == nil {
		return
	}
	l.clearFlatEffectFields()
	switch l.Type {
	case "static_color":
		if t.Static != nil {
			l.Color = t.Static.Color
		}
	case "rainbow_wave":
		if t.RainbowWave != nil {
			l.Speed = t.RainbowWave.Speed
			l.Scale = t.RainbowWave.Scale
			l.Tint = t.RainbowWave.Tint
			l.TintMix = t.RainbowWave.TintMix
			l.Colors = t.RainbowWave.Colors
		}
	case "liquid_plasma":
		if t.LiquidPlasma != nil {
			l.Colors = t.LiquidPlasma.Colors
			l.Speed = t.LiquidPlasma.Speed
			l.Scale = t.LiquidPlasma.Scale
			l.WaveComplexity = t.LiquidPlasma.WaveComplexity
			l.MixMode = t.LiquidPlasma.MixMode
		}
	case "smoke":
		if t.Smoke != nil {
			l.Speed = t.Smoke.Speed
			l.Scale = t.Smoke.Scale
			l.Octaves = t.Smoke.Octaves
			l.Persistence = t.Smoke.Persistence
			l.Lacunarity = t.Smoke.Lacunarity
			l.DriftX = t.Smoke.DriftX
			l.DriftY = t.Smoke.DriftY
			l.Contrast = t.Smoke.Contrast
			l.ColorLow = t.Smoke.ColorLow
			l.ColorHigh = t.Smoke.ColorHigh
		}
	case "star_matrix":
		if t.StarMatrix != nil {
			l.Star = t.StarMatrix.Star
			l.Background = t.StarMatrix.Background
			l.Density = t.StarMatrix.Density
			l.Speed = t.StarMatrix.Speed
		}
	case "doom_fire":
		if t.DoomFire != nil {
			l.Speed = t.DoomFire.Speed
			l.Cooling = t.DoomFire.Cooling
			l.SparkChance = t.DoomFire.SparkChance
			l.SparkIntensity = t.DoomFire.SparkIntensity
		}
	case "reactive_ripple":
		if t.ReactiveRipple != nil {
			l.Color = t.ReactiveRipple.Color
			l.BaseColor = t.ReactiveRipple.BaseColor
			l.WaveSpeed = t.ReactiveRipple.WaveSpeed
			l.DecayTime = t.ReactiveRipple.DecayTime
			l.Thickness = t.ReactiveRipple.Thickness
			l.Intensity = t.ReactiveRipple.Intensity
		}
	case "reaction_diffusion":
		if t.ReactionDiffusion != nil {
			l.BaseColor = t.ReactionDiffusion.ColorA
			l.Color = t.ReactionDiffusion.ColorB
			l.Du = t.ReactionDiffusion.Du
			l.Dv = t.ReactionDiffusion.Dv
			l.Feed = t.ReactionDiffusion.Feed
			l.Kill = t.ReactionDiffusion.Kill
			l.Width = t.ReactionDiffusion.Width
			l.Height = t.ReactionDiffusion.Height
			l.Steps = t.ReactionDiffusion.Steps
			l.Zoom = t.ReactionDiffusion.Zoom
			l.Speed = t.ReactionDiffusion.Speed
			l.InjectionAmount = t.ReactionDiffusion.InjectionAmount
			l.InjectionRadius = t.ReactionDiffusion.InjectionRadius
			l.InjectionDecay = t.ReactionDiffusion.InjectionDecay
			l.InjectionHistory = t.ReactionDiffusion.InjectionHistory
		}
	}
}
