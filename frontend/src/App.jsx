import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { LoadConfig, SaveConfig, LoadLayout } from "../wailsjs/go/main/App";
import PresetEditor from './components/PresetEditor';
import KeyboardVisualizer from './components/KeyboardVisualizer';

// Helper Styles
const NAV_BTN = { padding: '10px 20px', background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontSize: '16px', borderBottom: '2px solid transparent' };
const NAV_ACTIVE = { ...NAV_BTN, color: '#ff0e82', borderBottom: '2px solid #ff0e82' };
const SIDEBAR_ITEM = { padding: '8px 15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '14px' };

function App() {
    const [config, setConfig] = useState(null);
    const [layout, setLayout] = useState([]);
    const [activeTab, setActiveTab] = useState('presets'); 
    const [selectedItem, setSelectedItem] = useState(null); 
    const [status, setStatus] = useState("Loading...");

    // --- BUG FIX: Reset selection when tab changes ---
    useEffect(() => {
        setSelectedItem(null);
    }, [activeTab]);
    // ------------------------------------------------

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

    const handleSave = async () => {
        setStatus("Saving...");
        await SaveConfig(config);
        setStatus("Saved!");
        setTimeout(() => setStatus("Ready"), 2000);
    };

    const updatePreset = (name, data) => {
        const newPresets = { ...config.presets };
        if (data === null) {
            delete newPresets[name];
            setSelectedItem(null); // Deselect if deleted
        } else {
            newPresets[name] = data;
        }
        setConfig({ ...config, presets: newPresets });
    };

    const createItem = () => {
        const name = prompt("Enter name:");
        if (!name) return;
        if (activeTab === 'presets') {
            setConfig(prev => ({ ...prev, presets: { ...prev.presets, [name]: { type: "static_color", color: "#ffffff" } } }));
        } else if (activeTab === 'profiles') {
            setConfig(prev => ({ ...prev, profiles: { ...prev.profiles, [name]: { layers: [] } } }));
        }
        setSelectedItem(name);
    };

    // --- HELPER: Calculate Preview Color for Visualizer ---
    // This logic decides what color to show on the keyboard based on the preset type
    const getPreviewColor = (presetName) => {
        if (!config || !config.presets[presetName]) return null;
        const p = config.presets[presetName];

        if (p.type === 'static_color') return p.color;
        if (p.type === 'reaction_diffusion') return p.color_b; // Show the "Growth" color
        if (p.type === 'star_matrix') return p.star;           // Show the Star color
        if (p.type === 'liquid_plasma' || p.type === 'smoke') {
            // Return the first color, or a default if empty
            return (p.colors && p.colors.length > 0) ? p.colors[0] : '#333';
        }
        return '#444'; // Default grey
    };
    // ----------------------------------------------------

    if (!config) return <div style={{padding: 50, color: 'white'}}>{status}</div>;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#050505', color: '#e0e0e0', fontFamily: 'Segoe UI, sans-serif' }}>
            
            {/* HEADER */}
            <div style={{ display: 'flex', borderBottom: '1px solid #333', alignItems: 'center', padding: '0 10px', height: '50px' }}>
                <button style={activeTab === 'presets' ? NAV_ACTIVE : NAV_BTN} onClick={() => setActiveTab('presets')}>Presets</button>
                <button style={activeTab === 'profiles' ? NAV_ACTIVE : NAV_BTN} onClick={() => setActiveTab('profiles')}>Profiles</button>
                <button style={activeTab === 'apps' ? NAV_ACTIVE : NAV_BTN} onClick={() => setActiveTab('apps')}>Apps</button>
                <div style={{flex:1}} />
                <button onClick={handleSave} style={{ background: '#ff0e82', color: '#fff', border: 'none', padding: '6px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>SAVE DISK</button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                
                {/* SIDEBAR */}
                {activeTab !== 'apps' && (
                    <div style={{ width: '220px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
                        <button onClick={createItem} style={{ background: '#111', color: '#ff0e82', border: 'none', padding: 12, cursor: 'pointer', borderBottom: '1px solid #333', fontWeight: 'bold' }}>+ NEW {activeTab.slice(0, -1).toUpperCase()}</button>
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

                {/* MAIN CONTENT - SPLIT VIEW FOR BOTH TABS */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    
                    {/* TOP: VISUALIZER (Shared for Presets & Profiles) */}
                    {(activeTab === 'presets' || activeTab === 'profiles') && selectedItem && (
                        <div style={{ height: '40%', background: '#000', borderBottom: '1px solid #333', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{transform: 'scale(0.7)'}}>
                                <KeyboardVisualizer 
                                    layout={layout}
                                    // If in PRESETS tab, force the whole keyboard to the preview color
                                    forcedColor={activeTab === 'presets' ? getPreviewColor(selectedItem) : null}
                                    
                                    // If in PROFILES tab, (Future: highlight specific zones)
                                    activeKeys={[]} 
                                    activeZones={[]} 
                                    onKeyClick={() => {}}
                                />
                            </div>
                        </div>
                    )}

                    {/* BOTTOM: EDITORS */}
                    <div style={{ flex: 1, overflowY: 'auto', background: '#111' }}>
                        
                        {/* 1. PRESET EDITOR FORM */}
                        {activeTab === 'presets' && selectedItem && (
                            <PresetEditor 
                                preset={config.presets[selectedItem]} 
                                onChange={(d) => updatePreset(selectedItem, d)} 
                            />
                        )}

                        {/* 2. PROFILE EDITOR FORM */}
                        {activeTab === 'profiles' && selectedItem && (
                            <div style={{padding: 20}}>
                                <h2 style={{marginTop:0}}>Layers for {selectedItem}</h2>
                                {/* ... (Your existing Profile Layer logic here) ... */}
                                {(config.profiles[selectedItem]?.layers || []).map((layer, i) => (
                                    <div key={i} style={{background: '#222', padding: 10, marginBottom: 5, borderRadius: 4, display:'flex', justifyContent:'space-between'}}>
                                        <span>{layer.preset}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!selectedItem && activeTab !== 'apps' && (
                            <div style={{padding: 50, color: '#444', textAlign: 'center'}}>Select an item from the sidebar to edit</div>
                        )}
                        
                        {/* APP BINDINGS (As before) */}
                        {activeTab === 'apps' && (
                           <div style={{padding: 20}}>App Bindings Table...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;