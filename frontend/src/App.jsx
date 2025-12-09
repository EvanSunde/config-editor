import { useState, useEffect } from 'react';
import { LoadConfig, SaveConfig } from "../wailsjs/go/main/App";
import PresetEditor from './components/PresetEditor';
import KeyboardVisualizer from './components/KeyboardVisualizer';

const NAV_STYLE = { padding: '15px', background: '#111', color: '#888', cursor: 'pointer', borderBottom: '2px solid transparent' };
const ACTIVE_NAV = { ...NAV_STYLE, color: '#ff0e82', borderBottom: '2px solid #ff0e82' };

function App() {
    const [config, setConfig] = useState(null);
    const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'profiles'
    const [selectedItem, setSelectedItem] = useState(null); // Key of the preset or profile being edited
    const [status, setStatus] = useState("Connecting to Engine...");

    useEffect(() => {
        LoadConfig().then(data => {
            setConfig(data);
            setStatus("Config Loaded");
        });
    }, []);

    const handleSave = async () => {
        setStatus("Saving...");
        await SaveConfig(config);
        setStatus("Saved to Disk!");
        setTimeout(() => setStatus("Ready"), 2000);
    };

    // Helper to update global config state
    const updatePreset = (name, newPresetData) => {
        setConfig(prev => ({
            ...prev,
            presets: { ...prev.presets, [name]: newPresetData }
        }));
    };

    if (!config) return <div style={{color: '#fff', padding: 50}}>{status}</div>;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#050505', color: 'white', fontFamily: 'monospace' }}>
            
            {/* TOP BAR */}
            <div style={{ display: 'flex', borderBottom: '1px solid #333', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20 }}>
                <div style={{display: 'flex'}}>
                    <div style={activeTab === 'presets' ? ACTIVE_NAV : NAV_STYLE} onClick={() => {setActiveTab('presets'); setSelectedItem(null);}}>Presets</div>
                    <div style={activeTab === 'profiles' ? ACTIVE_NAV : NAV_STYLE} onClick={() => {setActiveTab('profiles'); setSelectedItem(null);}}>Profiles</div>
                </div>
                <div style={{color: status.includes("Saved") ? '#0f0' : '#666'}}>{status}</div>
                <button onClick={handleSave} style={{ background: '#ff0e82', border: 'none', color: '#fff', padding: '8px 20px', cursor: 'pointer', fontWeight: 'bold' }}>SAVE</button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                
                {/* SIDEBAR LIST */}
                <div style={{ width: '250px', borderRight: '1px solid #333', overflowY: 'auto' }}>
                    {activeTab === 'presets' && Object.keys(config.presets).map(name => (
                        <div 
                            key={name}
                            onClick={() => setSelectedItem(name)}
                            style={{ padding: '10px 20px', cursor: 'pointer', background: selectedItem === name ? '#222' : 'transparent', color: selectedItem === name ? '#ff0e82' : '#ccc' }}
                        >
                            {name}
                        </div>
                    ))}
                    {activeTab === 'profiles' && Object.keys(config.profiles).map(name => (
                        <div 
                            key={name}
                            onClick={() => setSelectedItem(name)}
                            style={{ padding: '10px 20px', cursor: 'pointer', background: selectedItem === name ? '#222' : 'transparent', color: selectedItem === name ? '#ff0e82' : '#ccc' }}
                        >
                            {name}
                        </div>
                    ))}
                </div>

                {/* MAIN CONTENT AREA */}
                <div style={{ flex: 1, display: 'flex' }}>
                    
                    {/* EDITOR PANEL */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {activeTab === 'presets' && selectedItem && (
                            <PresetEditor 
                                preset={config.presets[selectedItem]} 
                                onChange={(updated) => updatePreset(selectedItem, updated)} 
                            />
                        )}

                        {activeTab === 'profiles' && selectedItem && (
                            <div style={{padding: 20}}>
                                <h2 style={{color: '#ff0e82'}}>Editing Profile: {selectedItem}</h2>
                                <KeyboardVisualizer 
                                    activeZones={[]} 
                                    activeKeys={[]} // You can map layers to keys here later
                                    onKeyClick={(k) => console.log("Key clicked:", k)}
                                />
                                
                                <h3 style={{marginTop: 30}}>Layers</h3>
                                {(config.profiles[selectedItem].layers || []).map((layer, idx) => (
                                    <div key={idx} style={{ background: '#222', padding: 10, marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Layer {idx + 1}: <strong style={{color: '#ffcb0e'}}>{layer.preset}</strong></span>
                                        <div>
                                            <span style={{fontSize: 12, color: '#888', marginRight: 10}}>
                                                {layer.zones ? `Zones: ${layer.zones.join(', ')}` : ''} 
                                                {layer.keys ? ` Keys: ${layer.keys.length}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;