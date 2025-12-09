import { useState, useEffect } from 'react'; 
import { LoadConfig, SaveConfig, LoadLayout } from "../wailsjs/go/main/App";
import PresetEditor from './components/PresetEditor';
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

function App() {
    const [config, setConfig] = useState(null);
    const [layout, setLayout] = useState([]);
    const [activeTab, setActiveTab] = useState('presets'); 
    const [selectedItem, setSelectedItem] = useState(null); 
    // NEW: Track which layer index is currently being "Painted"
    const [editingLayerIdx, setEditingLayerIdx] = useState(null);
    const [status, setStatus] = useState("Loading...");

    // 1. LOAD
    useEffect(() => {
        LoadConfig().then(async (data) => {
            setConfig(data);
            setStatus("Config Loaded");
            if (data.device?.layout) {
                try {
                    const l = await LoadLayout(data.device.layout);
                    setLayout(l);
                } catch(e) { console.error(e); }
            }
        });
    }, []);

    // Reset editing layer when changing profiles
    useEffect(() => {
        setEditingLayerIdx(null);
    }, [selectedItem, activeTab]);

    // 2. SAVE
    const handleSave = async () => {
        setStatus("Saving...");
        await SaveConfig(config);
        setStatus("Saved!");
        setTimeout(() => setStatus("Ready"), 2000);
    };

    // 3. LOGIC: Calculate Colors for the Visualizer
    const getVisualizerColors = () => {
        if (!config || !selectedItem) return {};
        const colors = {}; 

        // CASE A: PRESETS TAB 
        if (activeTab === 'presets') {
            const p = config.presets[selectedItem];
            if (!p) return {};
            let hex = '#444'; 
            if (p.type === 'static_color') hex = p.color;
            else if (p.type === 'reactive_ripple') hex = p.color;
            else if (p.type === 'reaction_diffusion') hex = p.color_b;
            else if (p.type === 'star_matrix') hex = p.star;
            else if (p.colors && p.colors.length > 0) hex = p.colors[0];
            layout.forEach(k => colors[k.label] = hex);
        }

        // CASE B: PROFILES TAB
        else if (activeTab === 'profiles') {
            const profile = config.profiles[selectedItem];
            if (!profile || !profile.layers) return {};

            // SUB-CASE: EDITING A SPECIFIC LAYER (Mask Mode)
            // If we are editing a layer, dim everything else to show what this layer covers
            if (editingLayerIdx !== null && profile.layers[editingLayerIdx]) {
                const targetLayer = profile.layers[editingLayerIdx];
                const preset = config.presets[targetLayer.preset];
                let activeColor = '#ff0e82'; // Default highlight
                
                // Try to use the preset's actual color for the highlight
                if(preset) {
                    if (preset.type === 'static_color') activeColor = preset.color;
                    else if (preset.colors && preset.colors.length > 0) activeColor = preset.colors[0];
                }

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
                    const preset = config.presets[layer.preset];
                    if (!preset) return;
                    let layerColor = '#555';
                    if (preset.type === 'static_color') layerColor = preset.color;
                    else if (preset.colors && preset.colors.length > 0) layerColor = preset.colors[0];
                    else if (preset.color_b) layerColor = preset.color_b;

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
        if (activeTab === 'profiles' && editingLayerIdx !== null) {
            const newProfiles = { ...config.profiles };
            const layer = newProfiles[selectedItem].layers[editingLayerIdx];
            
            // Initialize keys array if missing
            if (!layer.keys) layer.keys = [];

            if (layer.keys.includes(keyLabel)) {
                // Remove key
                layer.keys = layer.keys.filter(k => k !== keyLabel);
            } else {
                // Add key
                layer.keys.push(keyLabel);
            }
            
            setConfig({ ...config, profiles: newProfiles });
        }
    };

    // 5. HELPER: Toggle a Zone in the Active Layer
    const toggleZone = (layerIdx, zoneName) => {
        const newProfiles = { ...config.profiles };
        const layer = newProfiles[selectedItem].layers[layerIdx];
        if (!layer.zones) layer.zones = [];

        if (layer.zones.includes(zoneName)) {
            layer.zones = layer.zones.filter(z => z !== zoneName);
        } else {
            layer.zones.push(zoneName);
        }
        setConfig({ ...config, profiles: newProfiles });
    };

    const updateLayer = (layerIndex, field, value) => {
        const newProfiles = { ...config.profiles };
        newProfiles[selectedItem].layers[layerIndex][field] = value;
        setConfig({ ...config, profiles: newProfiles });
    };

    if (!config) return <div style={{padding: 50, color: 'white'}}>{status}</div>;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#050505', color: '#e0e0e0', fontFamily: 'sans-serif' }}>
            
            {/* HEADER */}
            <div style={{ display: 'flex', borderBottom: '1px solid #333', alignItems: 'center', padding: '0 10px', height: '50px' }}>
                <button style={activeTab === 'presets' ? NAV_ACTIVE : NAV_BTN} onClick={() => {setActiveTab('presets'); setSelectedItem(null);}}>Presets</button>
                <button style={activeTab === 'profiles' ? NAV_ACTIVE : NAV_BTN} onClick={() => {setActiveTab('profiles'); setSelectedItem(null);}}>Profiles</button>
                <button style={activeTab === 'apps' ? NAV_ACTIVE : NAV_BTN} onClick={() => {setActiveTab('apps'); setSelectedItem(null);}}>Apps</button>
                <div style={{flex:1}} />
                <button onClick={handleSave} style={{ background: '#ff0e82', color: '#fff', border: 'none', padding: '6px 20px', borderRadius: 4, fontWeight: 'bold' }}>SAVE DISK</button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                
                {/* SIDEBAR */}
                {activeTab !== 'apps' && (
                    <div style={{ width: '220px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
                        <button onClick={() => {
                             const name = prompt("Name:"); 
                             if(name) {
                                 if(activeTab === 'presets') setConfig({...config, presets: {...config.presets, [name]: {type:'static_color', color:'#fff'}}});
                                 if(activeTab === 'profiles') setConfig({...config, profiles: {...config.profiles, [name]: {layers:[]}}});
                                 setSelectedItem(name);
                             }
                        }} style={{ background: '#111', color: '#ff0e82', border: 'none', padding: 12, borderBottom: '1px solid #333', fontWeight: 'bold' }}>+ NEW</button>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {Object.keys(config[activeTab]).sort().map(name => (
                                <div key={name} onClick={() => setSelectedItem(name)}
                                    style={{ ...SIDEBAR_ITEM, background: selectedItem === name ? '#222' : 'transparent', color: selectedItem === name ? '#ff0e82' : '#888', borderLeft: selectedItem === name ? '3px solid #ff0e82' : '3px solid transparent' }}>
                                    {name}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    
                    {/* VISUALIZER */}
                    {(activeTab === 'presets' || activeTab === 'profiles') && selectedItem && (
                        <div style={{ height: '45%', background: '#000', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection:'column' }}>
                            <div style={{transform: 'scale(0.8)'}}>
                                <KeyboardVisualizer 
                                    layout={layout}
                                    keyColors={getVisualizerColors()}
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
                        
                        {/* 1. PRESETS */}
                        {activeTab === 'presets' && selectedItem && (
                            <PresetEditor 
                                preset={config.presets[selectedItem]} 
                                onChange={(d) => {
                                    const newP = {...config.presets};
                                    if(d) newP[selectedItem] = d; else delete newP[selectedItem];
                                    setConfig({...config, presets: newP});
                                }} 
                            />
                        )}

                        {/* 2. PROFILES */}
                        {activeTab === 'profiles' && selectedItem && (
                            <div style={{padding: 20}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
                                    <h2 style={{margin:0}}>Layers: <span style={{color: '#fff'}}>{selectedItem}</span></h2>
                                    <button onClick={() => {
                                        const newProf = {...config.profiles};
                                        if(!newProf[selectedItem].layers) newProf[selectedItem].layers = [];
                                        newProf[selectedItem].layers.push({preset: Object.keys(config.presets)[0]});
                                        setConfig({...config, profiles: newProf});
                                    }} style={{background:'#ff0e82', color:'white', border:'none', padding:'8px 15px', borderRadius: 4, fontWeight:'bold', cursor:'pointer'}}>+ ADD LAYER</button>
                                </div>

                                {(config.profiles[selectedItem].layers || []).map((layer, idx) => {
                                    const isEditing = editingLayerIdx === idx;
                                    return (
                                        <div key={idx} style={{background: isEditing ? '#2a2a2a' : '#1a1a1a', padding: 15, marginBottom: 10, borderRadius: 5, border: isEditing ? '1px solid #ff0e82' : '1px solid #333'}}>
                                            
                                            {/* LAYER HEADER */}
                                            <div style={{display:'flex', gap: 10, marginBottom: 10, alignItems: 'center'}}>
                                                <div style={{fontWeight:'bold', color: '#666', width: 20}}>{idx+1}.</div>
                                                
                                                {/* PRESET SELECTOR */}
                                                <select 
                                                    style={{...SELECT_STYLE, flex: 1}}
                                                    value={layer.preset}
                                                    onChange={(e) => updateLayer(idx, 'preset', e.target.value)}
                                                >
                                                    {Object.keys(config.presets).map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                                
                                                {/* EDIT TOGGLE BUTTON */}
                                                <button 
                                                    onClick={() => setEditingLayerIdx(isEditing ? null : idx)}
                                                    style={{
                                                        background: isEditing ? '#ff0e82' : '#333',
                                                        color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12
                                                    }}
                                                >
                                                    {isEditing ? 'DONE' : 'EDIT ZONES/KEYS'}
                                                </button>

                                                <button style={{color:'#666', background:'transparent', border:'none', cursor:'pointer', fontSize: 18}} 
                                                    onClick={() => {
                                                        const newP = {...config.profiles};
                                                        newP[selectedItem].layers.splice(idx, 1);
                                                        setConfig({...config, profiles: newP});
                                                    }}>×</button>
                                            </div>
                                            
                                            {/* EXPANDED EDITING AREA */}
                                            {isEditing && (
                                                <div style={{marginTop: 15, paddingTop: 15, borderTop: '1px solid #333'}}>
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

                                                    <div style={{fontSize: 10, color: '#888', marginTop: 15, marginBottom: 5, textTransform: 'uppercase'}}>Manual Keys</div>
                                                    <div style={{color: '#ccc', fontSize: 12}}>
                                                        {layer.keys && layer.keys.length > 0 
                                                            ? `${layer.keys.length} keys selected. (Click visualizer to add/remove)` 
                                                            : "No manual keys. Click keys on the keyboard above to add them."}
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