import { useState, useEffect } from 'react'; 
import { LoadConfig, SaveConfig, LoadLayout } from "../wailsjs/go/main/App";
import EffectEditor from './components/PresetEditor';
import KeyboardVisualizer from './components/KeyboardVisualizer';

// --- STYLES ---
const NAV_BTN = { padding: '10px 20px', background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontSize: '16px', borderBottom: '2px solid transparent' };
const NAV_ACTIVE = { ...NAV_BTN, color: '#ff0e82', borderBottom: '2px solid #ff0e82' };
const SIDEBAR_ITEM = { padding: '8px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '14px' };
const TABLE_CELL = { padding: '10px', borderBottom: '1px solid #333' };
const SELECT_STYLE = {
    background: '#161616',
    color: '#f5f5f5',
    border: '1px solid #333',
    borderRadius: 4,
    padding: '6px 10px',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none'
};
const OPTION_STYLE = { background: '#151515', color: '#f5f5f5' };
const ZONE_TAG = { padding: '2px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', border: '1px solid #444', marginRight: 5, marginBottom: 5, display: 'inline-block' };
const ZONE_ACTIVE = { ...ZONE_TAG, background: '#ff0e82', color: 'white', borderColor: '#ff0e82' };
const createDefaultLayer = () => ({ type: 'static_color', color: '#ffffff' });

// Keep TOML/JSON clean: when switching type, drop unrelated fields
const REACTIVE_FIELDS = [
  'reactive','reactive_displacement','reactive_push','reactive_phase_shift','reactive_push_duration',
  'reactive_color','reactive_history','reactive_decay','reactive_spread','reactive_intensity'
];
const EFFECT_FIELDS = {
  static_color: ['color'],
  rainbow_wave: ['speed','scale','tint','tint_mix','colors'],
  liquid_plasma: ['colors','speed','scale','wave_complexity','mix_mode'],
  smoke: ['speed','scale','octaves','persistence','lacunarity','drift_x','drift_y','contrast','color_low','color_high'],
  star_matrix: ['star','background','density','speed'],
  doom_fire: ['speed','cooling','spark_chance','spark_intensity'],
  reactive_ripple: ['color','base_color','wave_speed','decay_time','thickness','intensity'],
  reaction_diffusion: ['color_a','color_b','du','dv','feed','kill','width','height','steps','zoom','speed','injection_amount','injection_radius','injection_decay','injection_history'],
  space_colonization: ['interaction_mode','attractors','influence_dist','segment_len','kill_dist','growth_interval','lifespan','fade_time','thickness','thickness_decay','color_root','color_tip']
};
const EFFECT_DEFAULTS = {
  static_color: { color: '#ffffff' },
  rainbow_wave: { speed: 0.8, scale: 0.5, tint: '#ffffff', tint_mix: 0 },
  liquid_plasma: { speed: 0.5, scale: 1.0, colors: ['#ff00ff','#00ffff'], wave_complexity: 1, mix_mode: 'linear' },
  smoke: { speed: 0.5, scale: 1.0, octaves: 3, persistence: 0.5, lacunarity: 2.0, drift_x: 0, drift_y: 0, contrast: 1, color_low: '#222222', color_high: '#ffffff' },
  star_matrix: { star: '#ffffff', background: '#000000', density: 0.2, speed: 0.5 },
  doom_fire: { speed: 1.0, cooling: 0.05, spark_chance: 0.5, spark_intensity: 1.0 },
  reactive_ripple: { color: '#00FF00', base_color: '#000000', wave_speed: 2.5, decay_time: 1.5, thickness: 0.2, intensity: 1.0 },
  reaction_diffusion: { color_a: '#000000', color_b: '#ffffff', du: 0.16, dv: 0.08, feed: 0.055, kill: 0.062, width: 64, height: 32, steps: 8, zoom: 1.0, speed: 1.0, injection_amount: 0, injection_radius: 0, injection_decay: 0, injection_history: 0 },
  space_colonization: {
    interaction_mode: 'food',
    attractors: 1000,
    influence_dist: 0.6,
    segment_len: 0.03,
    kill_dist: 0.035,
    growth_interval: 0.02,
    lifespan: 10.0,
    fade_time: 4.0,
    thickness: 0.03,
    thickness_decay: 0.99,
    color_root: '#00ffeeff',
    color_tip: '#00ff48df'
  }
};
const sanitizeLayerForType = (layer, newType) => {
  const keep = new Set(['type','zones','keys', ...(EFFECT_FIELDS[newType] || []), ...REACTIVE_FIELDS]);
  const next = { ...layer, type: newType, ...(EFFECT_DEFAULTS[newType] || {}) };
  Object.keys(next).forEach(k => { if (!keep.has(k)) delete next[k]; });
  return next;
};

const getLayerPreviewColor = (layer) => {
    if (!layer) return '#555';
    if (layer.type === 'static_color' && layer.color) return layer.color;
    if (layer.type === 'reaction_diffusion') return layer.color_b || layer.color_a || '#77ffee';
    if (layer.type === 'star_matrix') return layer.star || '#ffffff';
    if (layer.type === 'reactive_ripple') return layer.color || '#00ffcc';
    if (layer.type === 'liquid_plasma' || layer.type === 'smoke' || layer.type === 'rainbow_wave') {
        if (Array.isArray(layer.colors) && layer.colors.length > 0) return layer.colors[0];
        if (layer.tint) return layer.tint;
    }
    if (layer.base_color) return layer.base_color;
    if (layer.background) return layer.background;
    if (Array.isArray(layer.colors) && layer.colors.length > 0) return layer.colors[0];
    if (layer.color) return layer.color;
    return '#555';
};

function App() {
    const [config, setConfig] = useState(null);
    const [layout, setLayout] = useState([]);
    const [activeTab, setActiveTab] = useState('profiles');
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [selectedLayerIdx, setSelectedLayerIdx] = useState(null);
    const [editingLayerIdx, setEditingLayerIdx] = useState(null);
    const [draggingLayerIdx, setDraggingLayerIdx] = useState(null);
    const [status, setStatus] = useState("Loading...");

    // 1. LOAD
    useEffect(() => {
        LoadConfig().then(async (data) => {
            setConfig(data);
            setStatus("Config Loaded");
            // Auto-select default profile and first layer
            const defaultProf = data?.apps?.default_profile;
            const profiles = data?.profiles || {};
            const initialProfile = defaultProf && profiles[defaultProf] ? defaultProf : Object.keys(profiles)[0];
            if (initialProfile) {
                setSelectedProfile(initialProfile);
                const hasLayers = Array.isArray(profiles[initialProfile]?.layers) && profiles[initialProfile].layers.length > 0;
                setSelectedLayerIdx(hasLayers ? 0 : null);
            }
            if (data.device?.layout) {
                try {
                    const l = await LoadLayout(data.device.layout);
                    setLayout(l);
                } catch(e) { console.error(e); }
            }
        });
    }, []);

    useEffect(() => {
        setEditingLayerIdx(null);
    }, [selectedProfile, activeTab]);

    // 2. SAVE
    const handleSave = async () => {
        setStatus("Saving...");
        await SaveConfig(config);
        setStatus("Saved!");
        setTimeout(() => setStatus("Ready"), 2000);
    };

    // 3. LOGIC: Calculate Colors for the Visualizer
    const getVisualizerColors = () => {
        if (!config || !selectedProfile) return {};
        const colors = {}; 

        if (activeTab === 'profiles') {
            const profile = config.profiles[selectedProfile];
            if (!profile || !profile.layers) return {};

            // SUB-CASE: EDITING A SPECIFIC LAYER (Mask Mode)
            // If we are editing a layer, dim everything else to show what this layer covers
            if (editingLayerIdx !== null && profile.layers[editingLayerIdx]) {
                const targetLayer = profile.layers[editingLayerIdx];
                let activeColor = getLayerPreviewColor(targetLayer);

                // 1. Dim Background
                layout.forEach(k => colors[k.label] = '#111');

                // 2. Highlight Zones
                if (targetLayer.zones) {
                    targetLayer.zones.forEach(zName => {
                        (config.zones[zName] || []).forEach(k => colors[k] = activeColor);
                    });
                }
                // 3. Highlight Individual Keys
                if (targetLayer.keys) {
                    targetLayer.keys.forEach(k => colors[k] = activeColor);
                }
            } 
            // SUB-CASE: NORMAL PREVIEW (Composite all layers)
            else {
                profile.layers.forEach(layer => {
                    let layerColor = getLayerPreviewColor(layer);

                    if (layer.zones) layer.zones.forEach(z => (config.zones[z]||[]).forEach(k => colors[k] = layerColor));
                    if (layer.keys) layer.keys.forEach(k => colors[k] = layerColor);
                    
                    // Background layer (no keys/zones defined) paints everything
                    if ((!layer.zones || layer.zones.length === 0) && (!layer.keys || layer.keys.length === 0)) {
                        layout.forEach(k => colors[k.label] = layerColor);
                    }
                });
            }
        }
        return colors;
    };

    // 4. HELPER: Toggle a Key in the Active Layer
    const handleKeyClick = (keyLabel) => {
        if (activeTab === 'profiles' && editingLayerIdx !== null && selectedProfile) {
            setConfig(prev => {
                const profiles = { ...prev.profiles };
                const profile = { ...profiles[selectedProfile] };
                const layers = [...(profile.layers || [])];
                const layer = { ...layers[editingLayerIdx] };

                const keys = new Set(layer.keys || []);
                if (keys.has(keyLabel)) keys.delete(keyLabel); else keys.add(keyLabel);
                layer.keys = Array.from(keys);

                layers[editingLayerIdx] = layer;
                profile.layers = layers;
                profiles[selectedProfile] = profile;
                return { ...prev, profiles };
            });
        }
    };

    // 5. HELPER: Toggle a Zone in the Active Layer
    const toggleZone = (layerIdx, zoneName) => {
        if (!selectedProfile) return;
        setConfig(prev => {
            const profiles = { ...prev.profiles };
            const profile = { ...profiles[selectedProfile] };
            const layers = [...(profile.layers || [])];
            const layer = { ...layers[layerIdx] };
            const zones = new Set(layer.zones || []);
            if (zones.has(zoneName)) zones.delete(zoneName); else zones.add(zoneName);
            layer.zones = Array.from(zones);
            layers[layerIdx] = layer;
            profile.layers = layers;
            profiles[selectedProfile] = profile;
            return { ...prev, profiles };
        });
    };

    const reorderLayers = (fromIdx, toIdx) => {
        if (!selectedProfile || fromIdx === toIdx) return;
        setConfig(prev => {
            const profiles = { ...prev.profiles };
            const profile = { ...profiles[selectedProfile] };
            const layers = [...(profile.layers || [])];
            const [moved] = layers.splice(fromIdx, 1);
            layers.splice(toIdx, 0, moved);
            profile.layers = layers;
            profiles[selectedProfile] = profile;
            return { ...prev, profiles };
        });

        const adjustIndex = (current) => {
            if (current === null) return current;
            if (current === fromIdx) return toIdx;
            if (fromIdx < toIdx && current > fromIdx && current <= toIdx) return current - 1;
            if (fromIdx > toIdx && current < fromIdx && current >= toIdx) return current + 1;
            return current;
        };

        setSelectedLayerIdx(prev => adjustIndex(prev));
        setEditingLayerIdx(prev => adjustIndex(prev));
    };

    const handleLayerDragStart = (idx) => setDraggingLayerIdx(idx);
    const handleLayerDragOver = (e, idx) => {
        e.preventDefault();
        if (draggingLayerIdx === null || draggingLayerIdx === idx) return;
        reorderLayers(draggingLayerIdx, idx);
        setDraggingLayerIdx(idx);
    };
    const handleLayerDragEnd = () => setDraggingLayerIdx(null);

    const updateLayer = (layerIndex, nextLayer) => {
        if (!selectedProfile) return;
        setConfig(prev => {
            const profiles = { ...prev.profiles };
            const profile = { ...profiles[selectedProfile] };
            const layers = [...(profile.layers || [])];
            layers[layerIndex] = { ...nextLayer };
            profile.layers = layers;
            profiles[selectedProfile] = profile;
            return { ...prev, profiles };
        });
    };

    const addLayer = () => {
        if (!selectedProfile) return;
        setConfig(prev => {
            const profiles = { ...prev.profiles };
            const profile = { ...profiles[selectedProfile] };
            const layers = [...(profile.layers || [])];
            layers.push(createDefaultLayer());
            profile.layers = layers;
            profiles[selectedProfile] = profile;
            setSelectedLayerIdx(layers.length - 1);
            setEditingLayerIdx(layers.length - 1);
            return { ...prev, profiles };
        });
    };

    const removeLayer = (idx) => {
        if (!selectedProfile) return;
        setConfig(prev => {
            const profiles = { ...prev.profiles };
            const profile = { ...profiles[selectedProfile] };
            const layers = [...(profile.layers || [])];
            layers.splice(idx, 1);
            profile.layers = layers;
            profiles[selectedProfile] = profile;
            if (selectedLayerIdx === idx) setSelectedLayerIdx(null);
            setEditingLayerIdx(null);
            return { ...prev, profiles };
        });
    };

    if (!config) return <div style={{padding: 50, color: 'white'}}>{status}</div>;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#050505', color: '#e0e0e0', fontFamily: 'sans-serif' }}>
            
            {/* HEADER */}
            <div style={{ display: 'flex', borderBottom: '1px solid #333', alignItems: 'center', padding: '0 10px', height: '50px' }}>
                <button style={activeTab === 'profiles' ? NAV_ACTIVE : NAV_BTN} onClick={() => {setActiveTab('profiles'); setSelectedProfile(null); setSelectedLayerIdx(null);}}>Profiles</button>
                <button style={activeTab === 'apps' ? NAV_ACTIVE : NAV_BTN} onClick={() => {setActiveTab('apps');}}>Apps</button>
                <div style={{flex:1}} />
                <button onClick={handleSave} style={{ background: '#ff0e82', color: '#fff', border: 'none', padding: '6px 20px', borderRadius: 4, fontWeight: 'bold' }}>SAVE DISK</button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                
                {/* SIDEBAR */}
                {activeTab === 'profiles' && (
                    <div style={{ width: '220px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
                        <button onClick={() => {
                             const name = prompt("Name:"); 
                             if(name) {
                                 setConfig({...config, profiles: {...config.profiles, [name]: {layers:[createDefaultLayer()]}}});
                                 setSelectedProfile(name);
                                 setSelectedLayerIdx(0);
                             }
                        }} style={{ background: '#111', color: '#ff0e82', border: 'none', padding: 12, borderBottom: '1px solid #333', fontWeight: 'bold' }}>+ NEW</button>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {Object.keys(config.profiles).sort().map(name => (
                                <div key={name} onClick={() => { 
                                        setSelectedProfile(name); 
                                        const firstIdx = (config.profiles[name]?.layers?.length ?? 0) > 0 ? 0 : null;
                                        setSelectedLayerIdx(firstIdx);
                                        setEditingLayerIdx(null); 
                                    }}
                                    style={{ ...SIDEBAR_ITEM, background: selectedProfile === name ? '#222' : 'transparent', color: selectedProfile === name ? '#ff0e82' : '#888', borderLeft: selectedProfile === name ? '3px solid #ff0e82' : '3px solid transparent' }}>
                                    {name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    
                    {/* VISUALIZER */}
                    {(activeTab === 'profiles') && selectedProfile && (
                        <div style={{ height: '45%', background: '#000', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection:'column' }}>
                            <div style={{transform: 'scale(0.8)'}}>
                                <KeyboardVisualizer 
                                    layout={layout}
                                    keyColors={getVisualizerColors()}
                                    preset={selectedLayerIdx !== null ? (config.profiles[selectedProfile]?.layers?.[selectedLayerIdx] || null) : null}
                                    layers={config.profiles[selectedProfile]?.layers || []}
                                    zones={config.zones}
                                    onKeyClick={handleKeyClick} 
                                />
                            </div>
                            {activeTab === 'profiles' && editingLayerIdx !== null && (
                                <div style={{marginTop: 10, color: '#ff0e82', fontSize: 12, fontWeight: 'bold', animation: 'pulse 1s infinite'}}>
                                    EDITING LAYER {editingLayerIdx + 1}: CLICK KEYS TO PAINT
                                </div>
                            )}
                        </div>
                    )}

                    {/* EDITORS */}
                    <div style={{ flex: 1, overflowY: 'auto', background: '#111' }}>
                        
                        {activeTab === 'profiles' && selectedProfile && (
                            <div style={{padding: 20}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
                                    <h2 style={{margin:0}}>Layers: <span style={{color: '#fff'}}>{selectedProfile}</span></h2>
                                    <button onClick={addLayer} style={{background:'#ff0e82', color:'white', border:'none', padding:'8px 15px', borderRadius: 4, fontWeight:'bold', cursor:'pointer'}}>+ ADD LAYER</button>
                                </div>

                                {(config.profiles[selectedProfile].layers || []).map((layer, idx) => {
                                    const isEditing = editingLayerIdx === idx;
                                    return (
                                        <div 
                                            key={idx}
                                            draggable
                                            onDragStart={() => handleLayerDragStart(idx)}
                                            onDragOver={(e) => handleLayerDragOver(e, idx)}
                                            onDragEnd={handleLayerDragEnd}
                                            onClick={() => setSelectedLayerIdx(idx)}
                                            style={{
                                                background: isEditing ? '#2a2a2a' : '#1a1a1a',
                                                padding: 15,
                                                marginBottom: 10,
                                                borderRadius: 5,
                                                border: isEditing ? '1px solid #ff0e82' : '1px solid #333',
                                                cursor:'pointer',
                                                opacity: draggingLayerIdx === idx ? 0.6 : 1
                                            }}
                                        >
                                            
                                            {/* LAYER HEADER */}
                                            <div style={{display:'flex', gap: 10, marginBottom: 10, alignItems: 'center'}}>
                                                <div style={{fontWeight:'bold', color: '#666', width: 20, cursor:'grab'}} title="Drag to reorder">{idx+1}.</div>
                                                
                                                <div style={{flex:1}}>
                                                    <div style={{fontSize:12, color:'#888', marginBottom:4}}>Effect Type</div>
                                                    <select 
                                                        style={{...SELECT_STYLE, width: '100%'}}
                                                        value={layer.type}
                                                        onChange={(e) => updateLayer(idx, sanitizeLayerForType(layer, e.target.value))}
                                                    >
                                                        <option value="static_color">Static Color</option>
                                                        <option value="liquid_plasma">Liquid Plasma</option>
                                                        <option value="reaction_diffusion">Reaction Diffusion</option>
                                                        <option value="star_matrix">Star Matrix</option>
                                                        <option value="smoke">Smoke</option>
                                                        <option value="rainbow_wave">Rainbow Wave</option>
                                                        <option value="doom_fire">Doom Fire</option>
                                                        <option value="reactive_ripple">Reactive Ripple</option>
                                                        <option value="space_colonization">Space Colonization</option>
                                                    </select>
                                                </div>

                                                {/* EDIT TOGGLE BUTTON */}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingLayerIdx(isEditing ? null : idx);
                                                        setSelectedLayerIdx(idx);
                                                    }}
                                                    style={{
                                                        background: isEditing ? '#ff0e82' : '#333',
                                                        color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12
                                                    }}
                                                >
                                                    {isEditing ? 'DONE' : 'EDIT ZONES/KEYS'}
                                                </button>

                                                <button style={{color:'#666', background:'transparent', border:'none', cursor:'pointer', fontSize: 18}} 
                                                    onClick={() => removeLayer(idx)}>×</button>
                                            </div>

                                            {/* EXPANDED EDITING AREA */}
                                            {isEditing && (
                                                <div style={{marginTop: 15, paddingTop: 15, borderTop: '1px solid #333'}}>
                                                    <div style={{display:'grid', gridTemplateColumns:'1fr', gap: 16}}>
                                                        {/* Inline Effect Editor */}
                                                        <EffectEditor 
                                                            preset={layer}
                                                            onChange={(next) => updateLayer(idx, next)}
                                                        />

                                                        {/* Zones toggles */}
                                                        <div>
                                                            <div style={{fontSize: 10, color: '#888', marginBottom: 5, textTransform: 'uppercase'}}>Toggle Zones</div>
                                                            <div>
                                                                {Object.keys(config.zones).map(zName => {
                                                                    const isActive = layer.zones && layer.zones.includes(zName);
                                                                    return (
                                                                        <span 
                                                                            key={zName} 
                                                                            onClick={() => toggleZone(idx, zName)}
                                                                            style={isActive ? ZONE_ACTIVE : ZONE_TAG}
                                                                        >
                                                                            {zName}
                                                                        </span>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Keys summary */}
                                                        <div>
                                                            <div style={{fontSize: 10, color: '#888', marginTop: 5, marginBottom: 5, textTransform: 'uppercase'}}>Manual Keys</div>
                                                            <div style={{color: '#ccc', fontSize: 12}}>
                                                                {layer.keys && layer.keys.length > 0 
                                                                    ? `${layer.keys.length} keys selected. (Click visualizer to add/remove)` 
                                                                    : "No manual keys. Click keys on the keyboard above to add them."}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* 3. APPS TABLE */}
                        {activeTab === 'apps' && (
                            <div style={{padding: 30}}>
                                <h2 style={{marginTop:0}}>Application Bindings</h2>
                                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                                    <thead>
                                        <tr style={{color: '#666', fontSize: 12, textTransform: 'uppercase'}}>
                                            <th style={TABLE_CELL}>Process Name</th>
                                            <th style={TABLE_CELL}>Profile</th>
                                            <th style={TABLE_CELL}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(config.apps?.mappings || {}).map(([app, val]) => {
                                            const profileName = typeof val === 'string' ? val : val.profile;
                                            return (
                                                <tr key={app}>
                                                    <td style={{...TABLE_CELL, color: '#ffcb0e'}}>{app}</td>
                                                    <td style={TABLE_CELL}>
                                                        <select 
                                                            value={profileName}
                                                            onChange={(e) => {
                                                                const newApps = {...config.apps.mappings};
                                                                // Preserve shortcut/other data if object, else just set string
                                                                if(typeof newApps[app] === 'object') newApps[app].profile = e.target.value;
                                                                else newApps[app] = e.target.value;
                                                                setConfig({...config, apps: {...config.apps, mappings: newApps}});
                                                            }}
                                                            style={SELECT_STYLE}
                                                        >
                                                            {Object.keys(config.profiles).map(p => (
                                                                <option key={p} value={p} style={OPTION_STYLE}>{p}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td style={TABLE_CELL}>
                                                        <button onClick={() => {
                                                            const newApps = {...config.apps.mappings};
                                                            delete newApps[app];
                                                            setConfig({...config, apps: {...config.apps, mappings: newApps}});
                                                        }} style={{color:'#666', border:'none', background:'transparent', cursor:'pointer'}}>Remove</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                <div style={{marginTop: 20, padding: 15, background: '#222', borderRadius: 5, display: 'inline-flex', gap: 10}}>
                                    <input id="newAppName" placeholder="e.g. firefox" style={{padding: 8, background: '#333', border: '1px solid #444', color: 'white'}} />
                                    <button onClick={() => {
                                        const name = document.getElementById('newAppName').value;
                                        if(name && !config.apps.mappings[name]) {
                                            setConfig({...config, apps: {...config.apps, mappings: {...config.apps.mappings, [name]: 'default'}}});
                                        }
                                    }} style={{padding: '8px 15px', background: '#ff0e82', color: 'white', border: 'none', cursor: 'pointer'}}>Add Binding</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;