# Redragon Configurator

Modern desktop tooling for editing Redragon keyboard lighting profiles.  
Built with **Wails (Go backend + React/Vite frontend)** so we get native access to the TOML config and a responsive UI for live editing.

---

## Features

- **Profile + Layer Editor** – Inline editing of every profile/layer with drag and drop ordering.
- **Full Effect Coverage** – Each lighting effect exposes all of its options (including advanced reactive + reaction-diffusion parameters).
- **Keyboard Visualizer** – Animated preview that composites all layers at ~30 FPS with targeted zones/keys.
- **Per-Key & Zone Assignment** – Click keys directly in the visualizer or toggle predefined zones.
- **Config Persistence** – Reads/Writes `~/.config/Redragon/config.toml`, auto-pruning unrelated effect fields.

---

## Project Layout

```
.
├── app.go / app_prune.go        # Wails backend (load/save, layout, pruning helpers)
├── typed_effects.go             # Internal typed structs for each effect
├── config.go                    # Config/TOML schema shared with frontend
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React app + layer editor
│   │   └── components/
│   │       ├── KeyboardVisualizer.jsx
│   │       └── PresetEditor.jsx
│   └── wailsjs/go/              # Auto-generated TypeScript bindings
└── wails.json                   # Wails project configuration
```

---

## Requirements

- Go 1.22+
- Node 18+ / pnpm (Vite dev server)
- Redragon config + layout files under `~/.config/Redragon/`
- Wails CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

---

## Development

```bash
# install JS deps
cd frontend && pnpm install

# run everything with hot reload
wails dev
```

Notes:

- Backend hot reload is handled by Wails; frontend hot reload is Vite on port 34115.
- `App.jsx` auto-loads the default profile and first layer for instant visual feedback.

---

## Configuration Tips

- **Config path:** `~/.config/Redragon/config.toml`
- **Layouts:** referenced via `device.layout` and loaded through the Go backend.
- **Zone definitions:** stored under `zones` and toggled directly in the layer editor.
- When switching effect types, unrelated properties are stripped automatically (frontend + backend).

---

## Building

```
wails build
```

Produces a distributable binary under `build/bin/RedragonConfigurator`.

---

## Troubleshooting

- If you edit Go structs (`config.go`) run `wails generate module` (or re-run `wails dev`) to refresh TS bindings.
- Ensure your config file is valid TOML; malformed entries will surface as load errors in the dev console.

---

## License

This project follows the original Redragon/Evan license terms. See `LICENSE` (if provided) or consult the project owner.
