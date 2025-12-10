package main

// buildPrunedConfig constructs a minimal map suitable for TOML encoding.
// It ensures each layer only contains fields relevant to its type, plus zones/keys.
func buildPrunedConfig(cfg Config) map[string]interface{} {
	out := map[string]interface{}{
		"device":    cfg.Device,
		"hypr":      cfg.Hypr,
		"zones":     cfg.Zones,
		"apps":      cfg.Apps,
		"shortcuts": cfg.Shortcuts,
	}

	profiles := make(map[string]interface{})
	for name, prof := range cfg.Profiles {
		// Layers
		var layers []map[string]interface{}
		for _, l := range prof.Layers {
			layers = append(layers, makeLayerTomlMap(l))
		}
		profiles[name] = map[string]interface{}{
			"layers": layers,
		}
	}
	out["profiles"] = profiles
	return out
}

// makeLayerTomlMap keeps only the type-relevant fields for a layer
func makeLayerTomlMap(l Layer) map[string]interface{} {
	m := map[string]interface{}{
		"type": l.Type,
	}

	// helpers
	addStr := func(k, v string) {
		if v != "" {
			m[k] = v
		}
	}
	addF := func(k string, v float64) {
		if v != 0 {
			m[k] = v
		}
	}
	addI := func(k string, v int) {
		if v != 0 {
			m[k] = v
		}
	}
	addB := func(k string, v bool) {
		if v {
			m[k] = v
		}
	}
	addSlice := func(k string, v []string) {
		if len(v) > 0 {
			m[k] = v
		}
	}

	switch l.Type {
	case "static_color":
		addStr("color", l.Color)
	case "rainbow_wave":
		addF("speed", l.Speed)
		addF("scale", l.Scale)
		addStr("tint", l.Tint)
		addF("tint_mix", l.TintMix)
		addSlice("colors", l.Colors)
	case "liquid_plasma":
		addSlice("colors", l.Colors)
		addF("speed", l.Speed)
		addF("scale", l.Scale)
		if l.WaveComplexity != 0 {
			m["wave_complexity"] = l.WaveComplexity
		}
		addStr("mix_mode", l.MixMode)
	case "smoke":
		addF("speed", l.Speed)
		addF("scale", l.Scale)
		if l.Octaves != 0 {
			m["octaves"] = l.Octaves
		}
		addF("persistence", l.Persistence)
		addF("lacunarity", l.Lacunarity)
		addF("drift_x", l.DriftX)
		addF("drift_y", l.DriftY)
		addF("contrast", l.Contrast)
		addStr("color_low", l.ColorLow)
		addStr("color_high", l.ColorHigh)
	case "star_matrix":
		addStr("star", l.Star)
		addStr("background", l.Background)
		addF("density", l.Density)
		addF("speed", l.Speed)
	case "doom_fire":
		addF("speed", l.Speed)
		addF("cooling", l.Cooling)
		addF("spark_chance", l.SparkChance)
		addF("spark_intensity", l.SparkIntensity)
	case "reactive_ripple":
		addStr("color", l.Color)
		addStr("base_color", l.BaseColor)
		addF("wave_speed", l.WaveSpeed)
		addF("decay_time", l.DecayTime)
		addF("thickness", l.Thickness)
		addF("intensity", l.Intensity)
	case "reaction_diffusion":
		// Dedicated RD color channels
		addStr("color_a", l.ColorA)
		addStr("color_b", l.ColorB)
		addF("du", l.Du)
		addF("dv", l.Dv)
		addF("feed", l.Feed)
		addF("kill", l.Kill)
		addI("width", l.Width)
		addI("height", l.Height)
		addI("steps", l.Steps)
		addF("zoom", l.Zoom)
		addF("speed", l.Speed)
		addF("injection_amount", l.InjectionAmount)
		addF("injection_radius", l.InjectionRadius)
		addF("injection_decay", l.InjectionDecay)
		addF("injection_history", l.InjectionHistory)
	}

	// Reactive block: include only if meaningful
	if l.Reactive || l.ReactiveDisplacement != 0 || l.ReactivePush || l.ReactivePhaseShift != 0 || l.ReactivePushDuration != 0 || l.ReactiveColor != "" || l.ReactiveHistory != 0 || l.ReactiveDecay != 0 || l.ReactiveSpread != 0 || l.ReactiveIntensity != 0 {
		if l.Reactive {
			m["reactive"] = true
		}
		addF("reactive_displacement", l.ReactiveDisplacement)
		addB("reactive_push", l.ReactivePush)
		addF("reactive_phase_shift", l.ReactivePhaseShift)
		addF("reactive_push_duration", l.ReactivePushDuration)
		addStr("reactive_color", l.ReactiveColor)
		addF("reactive_history", l.ReactiveHistory)
		addF("reactive_decay", l.ReactiveDecay)
		addF("reactive_spread", l.ReactiveSpread)
		addF("reactive_intensity", l.ReactiveIntensity)
	}

	// Coverage
	addSlice("zones", l.Zones)
	addSlice("keys", l.Keys)
	return m
}
