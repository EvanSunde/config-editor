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

function App() {
    const [config, setConfig] = useState(null);
    const [layout, setLayout] = useState([]);
    const [activeTab, setActiveTab] = useState('presets'); 
    const [selectedItem, setSelectedItem] = useState(null); 
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
        const colors = {}; // Map of "KeyLabel" -> "HexColor"

        // CASE A: PRESETS TAB (Paint whole keyboard one color)
        if (activeTab === 'presets') {
            const p = config.presets[selectedItem];
            if (!p) return {};
            
            // Extract a representative color from any preset type
            let hex = '#444'; 
            if (p.type === 'static_color') hex = p.color;
            else if (p.type === 'reaction_diffusion') hex = p.color_b;
            else if (p.type === 'star_matrix') hex = p.star;
            else if (p.colors && p.colors.length > 0) hex = p.colors[0];

            // Apply to ALL keys in layout
            layout.forEach(k => colors[k.label] = hex);
        }

        // CASE B: PROFILES TAB (Layer Compositing)
        else if (activeTab === 'profiles') {
            const profile = config.profiles[selectedItem];
            if (!profile || !profile.layers) return {};

            // Iterate layers from Bottom to Top
            profile.layers.forEach(layer => {
                const preset = config.presets[layer.preset];
                if (!preset) return;

                // Determine layer color
                let layerColor = '#555';
                if (preset.type === 'static_color') layerColor = preset.color;
                else if (preset.colors && preset.colors.length > 0) layerColor = preset.colors[0];
                else if (preset.color_b) layerColor = preset.color_b;

                // Apply to ZONES
                if (layer.zones) {
                    layer.zones.forEach(zoneName => {
                        const keysInZone = config.zones[zoneName] || [];
                        keysInZone.forEach(k => colors[k] = layerColor);
                    });
                }
                
                // Apply to SPECIFIC KEYS (overrides zones)
                if (layer.keys) {
                    layer.keys.forEach(k => colors[k] = layerColor);
                }
                
                // If no zones/keys defined, apply to everything (Background Layer)
                if ((!layer.zones || layer.zones.length === 0) && (!layer.keys || layer.keys.length === 0)) {
                    layout.forEach(k => colors[k.label] = layerColor);
                }
            });
        }
        return colors;
    };

    // 4. HELPER: Update a Profile Layer
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
                
                {/* SIDEBAR (Hidden for Apps) */}
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

                {/* MAIN AREA */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    
                    {/* VISUALIZER (Only Presets/Profiles) */}
                    {(activeTab === 'presets' || activeTab === 'profiles') && selectedItem && (
                        <div style={{ height: '40%', background: '#000', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{transform: 'scale(0.75)'}}>
                                <KeyboardVisualizer 
                                    layout={layout}
                                    keyColors={getVisualizerColors()} // <--- THE MAGIC HAPPENS HERE
                                    preset={activeTab === 'presets' ? config.presets[selectedItem] : null}
                                    onKeyClick={(k) => console.log(k)}
                                />
                            </div>
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
                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                    <h2 style={{margin:0}}>Layers: {selectedItem}</h2>
                                    <button onClick={() => {
                                        const newProf = {...config.profiles};
                                        if(!newProf[selectedItem].layers) newProf[selectedItem].layers = [];
                                        newProf[selectedItem].layers.push({preset: Object.keys(config.presets)[0]});
                                        setConfig({...config, profiles: newProf});
                                    }} style={{background:'#333', color:'white', border:'none', padding:'5px 10px'}}>+ Add Layer</button>
                                </div>

                                {(config.profiles[selectedItem].layers || []).map((layer, idx) => (
                                    <div key={idx} style={{background: '#222', padding: 15, marginTop: 10, borderRadius: 5, borderLeft: '3px solid #555'}}>
                                        <div style={{display:'flex', gap: 10, marginBottom: 10}}>
                                            <div style={{fontWeight:'bold', width: 20}}>{idx+1}.</div>
                                            <select 
                                                value={layer.preset}
                                                onChange={(e) => updateLayer(idx, 'preset', e.target.value)}
                                                style={{ ...SELECT_STYLE, flex: 1 }}
                                            >
                                                {Object.keys(config.presets).map(p => (
                                                    <option key={p} value={p} style={OPTION_STYLE}>{p}</option>
                                                ))}
                                            </select>
                                            <button style={{color:'red', background:'transparent', border:'none'}} 
                                                onClick={() => {
                                                    const newP = {...config.profiles};
                                                    newP[selectedItem].layers.splice(idx, 1);
                                                    setConfig({...config, profiles: newP});
                                                }}>X</button>
                                        </div>
                                        
                                        {/* ZONES EDITING */}
                                        <div style={{fontSize: 12, color: '#888'}}>
                                            Zones: {(layer.zones || []).join(', ')} <br/>
                                            {/* (To implement Zone editing: Add a Multi-Select or checkboxes for Zones here) */}
                                        </div>
                                    </div>
                                ))}
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