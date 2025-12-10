import React, { useState } from 'react';
import { HexColorPicker } from "react-colorful";

// --- STYLES ---
const CONTAINER_STYLE = { padding: '20px', background: '#1a1a1a', height: '100%', overflowY: 'auto', color: '#e0e0e0' };
const INPUT_STYLE = { padding: '8px', margin: '5px 0', background: '#252525', color: '#fff', border: '1px solid #444', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
const SELECT_STYLE = {
    ...INPUT_STYLE,
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    paddingRight: '28px',
    backgroundImage: 'linear-gradient(45deg, transparent 50%, #ff0e82 50%), linear-gradient(135deg, #ff0e82 50%, transparent 50%)',
    backgroundPosition: 'calc(100% - 20px) calc(50% - 2px), calc(100% - 12px) calc(50% - 2px)',
    backgroundSize: '8px 8px, 8px 8px',
    backgroundRepeat: 'no-repeat'
};
const OPTION_STYLE = { background: '#121212', color: '#f5f5f5' };
const LABEL_STYLE = { display: 'block', margin: '15px 0', fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' };
const HEADER_STYLE = { borderBottom: '1px solid #ff0e82', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const BTN_DANGER = { background: '#8b0000', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' };
const BTN_ICON = { background: '#333', color: 'white', border: '1px solid #555', width: '30px', height: '30px', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' };

// --- COLOR SWATCH COMPONENT ---
// Keeps the UI clean by hiding the wheel until clicked
const ColorSwatch = ({ color, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div style={{ position: 'relative', display: 'inline-block', marginRight: 10 }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    width: 36, height: 36, 
                    background: color, 
                    borderRadius: 4, 
                    border: '2px solid #555', 
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)' 
                }}
            />
            {isOpen && (
                <div style={{ position: 'absolute', top: '105%', left: 0, zIndex: 1000 }}>
                    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }} onClick={() => setIsOpen(false)} />
                    <HexColorPicker color={color} onChange={onChange} />
                </div>
            )}
        </div>
    );
};

export default function PresetEditor({ preset, onChange }) {
    if (!preset) return <div style={{padding: 20, color: '#666'}}>Select a preset from the sidebar to edit.</div>;

    const handleChange = (field, value) => {
        onChange({ ...preset, [field]: value });
    };

    return (
        <div style={CONTAINER_STYLE}>
            <div style={HEADER_STYLE}>
                <h2 style={{margin:0, color: '#fff'}}>Edit Preset</h2>
                <button style={BTN_DANGER} onClick={() => { if(confirm('Delete this preset?')) onChange(null); }}>
                    DELETE PRESET
                </button>
            </div>

            {/* --- COMMON: TYPE SELECTOR --- */}
            <label style={LABEL_STYLE}>Effect Type
                <select style={SELECT_STYLE} value={preset.type} onChange={e => handleChange('type', e.target.value)}>
                    <option value="static_color" style={OPTION_STYLE}>Static Color</option>
                    <option value="liquid_plasma" style={OPTION_STYLE}>Liquid Plasma</option>
                    <option value="reaction_diffusion" style={OPTION_STYLE}>Reaction Diffusion</option>
                    <option value="star_matrix" style={OPTION_STYLE}>Star Matrix</option>
                    <option value="smoke" style={OPTION_STYLE}>Smoke</option>
                    <option value="rainbow_wave" style={OPTION_STYLE}>Rainbow Wave</option>
                    <option value="doom_fire" style={OPTION_STYLE}>Doom Fire</option>
                    <option value="reactive_ripple" style={OPTION_STYLE}>Reactive Ripple</option>
                </select>
            </label>

            {/* --- STATIC COLOR --- */}
            {preset.type === 'static_color' && (
                <div style={{ background: '#222', padding: 15, borderRadius: 8 }}>
                    <label style={LABEL_STYLE}>Base Color</label>
                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                        <ColorSwatch color={preset.color || '#ffffff'} onChange={c => handleChange('color', c)} />
                        <input type="text" value={preset.color || '#ffffff'} onChange={e => handleChange('color', e.target.value)} style={{...INPUT_STYLE, width: 120, margin: 0}} />
                    </div>
                </div>
            )}

            {/* --- RAINBOW WAVE --- */}
            {preset.type === 'rainbow_wave' && (
                <div style={{ background: '#222', padding: 15, borderRadius: 8 }}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15}}>
                        <label style={LABEL_STYLE}>Speed ({preset.speed ?? 0.8})
                            <input type="range" min="0.1" max="3" step="0.1" value={preset.speed ?? 0.8} onChange={e => handleChange('speed', parseFloat(e.target.value))} />
                        </label>
                        <label style={LABEL_STYLE}>Scale ({preset.scale ?? 0.5})
                            <input type="range" min="0.05" max="1" step="0.05" value={preset.scale ?? 0.5} onChange={e => handleChange('scale', parseFloat(e.target.value))} />
                        </label>
                    </div>
                    <div style={{display:'flex', gap: 20, marginTop: 15}}>
                        <div>
                            <span style={{...LABEL_STYLE, marginBottom: 5}}>Tint</span>
                            <ColorSwatch color={preset.tint || '#ffffff'} onChange={c => handleChange('tint', c)} />
                        </div>
                        <label style={{...LABEL_STYLE, flex:1}}>Tint Mix ({preset.tint_mix ?? 0})
                            <input type="range" min="0" max="1" step="0.05" value={preset.tint_mix ?? 0} onChange={e => handleChange('tint_mix', parseFloat(e.target.value))} />
                        </label>
                    </div>
                </div>
            )}

            {/* --- FLUIDS (LIQUID / SMOKE) --- */}
            {['liquid_plasma', 'smoke', 'bio_ocean'].includes(preset.type) && (
                <>
                    <div style={{ background: '#222', padding: 15, borderRadius: 8, marginBottom: 15 }}>
                        <label style={LABEL_STYLE}>Color Palette (Ordered)</label>
                        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                            {(preset.colors || []).map((col, idx) => (
                                <div key={idx} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                    <ColorSwatch 
                                        color={col} 
                                        onChange={(c) => {
                                            const newColors = [...preset.colors];
                                            newColors[idx] = c;
                                            handleChange('colors', newColors);
                                        }}
                                    />
                                    {/* Small X button to remove color */}
                                    <div 
                                        onClick={() => {
                                            const newColors = preset.colors.filter((_, i) => i !== idx);
                                            handleChange('colors', newColors);
                                        }}
                                        style={{color: '#666', fontSize: 18, cursor: 'pointer', marginTop: 2}}
                                    >×</div>
                                </div>
                            ))}
                            <button 
                                onClick={() => handleChange('colors', [...(preset.colors || []), "#ffffff"])} 
                                style={BTN_ICON}
                                title="Add Color"
                            >+</button>
                        </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                        <label style={LABEL_STYLE}>Speed ({preset.speed})
                            <input type="range" min="0" max="2" step="0.1" value={preset.speed || 0.5} onChange={e => handleChange('speed', parseFloat(e.target.value))} style={{width: '100%'}}/>
                        </label>
                        <label style={LABEL_STYLE}>Scale ({preset.scale})
                            <input type="range" min="0.1" max="5" step="0.1" value={preset.scale || 1.0} onChange={e => handleChange('scale', parseFloat(e.target.value))} style={{width: '100%'}}/>
                        </label>
                        {preset.type === 'liquid_plasma' && (
                            <>
                                <label style={LABEL_STYLE}>Wave Complexity ({preset.wave_complexity || 1})
                                    <input type="number" min="1" max="10" value={preset.wave_complexity || 1} onChange={e => handleChange('wave_complexity', parseInt(e.target.value, 10))} style={INPUT_STYLE}/>
                                </label>
                                <label style={LABEL_STYLE}>Mix Mode
                                    <input type="text" value={preset.mix_mode || 'linear'} onChange={e => handleChange('mix_mode', e.target.value)} style={INPUT_STYLE}/>
                                </label>
                            </>
                        )}
                        {preset.type === 'smoke' && (
                            <>
                                <label style={LABEL_STYLE}>Octaves
                                    <input type="number" min="1" max="8" value={preset.octaves || 3} onChange={e => handleChange('octaves', parseInt(e.target.value, 10))} style={INPUT_STYLE}/>
                                </label>
                                <label style={LABEL_STYLE}>Persistence
                                    <input type="number" step="0.1" value={preset.persistence || 0.5} onChange={e => handleChange('persistence', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                                </label>
                                <label style={LABEL_STYLE}>Lacunarity
                                    <input type="number" step="0.1" value={preset.lacunarity || 2.0} onChange={e => handleChange('lacunarity', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                                </label>
                                <label style={LABEL_STYLE}>Drift X
                                    <input type="number" step="0.1" value={preset.drift_x || 0} onChange={e => handleChange('drift_x', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                                </label>
                                <label style={LABEL_STYLE}>Drift Y
                                    <input type="number" step="0.1" value={preset.drift_y || 0} onChange={e => handleChange('drift_y', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                                </label>
                                <label style={LABEL_STYLE}>Contrast
                                    <input type="number" step="0.1" value={preset.contrast || 1} onChange={e => handleChange('contrast', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                                </label>
                            </>
                        )}
                    </div>

                    {preset.type === 'smoke' && (
                        <div style={{display: 'flex', gap: 30, marginTop: 15}}>
                            <div>
                                <span style={{...LABEL_STYLE, marginBottom: 5}}>Color Low</span>
                                <ColorSwatch color={preset.color_low || '#222222'} onChange={c => handleChange('color_low', c)} />
                            </div>
                            <div>
                                <span style={{...LABEL_STYLE, marginBottom: 5}}>Color High</span>
                                <ColorSwatch color={preset.color_high || '#ffffff'} onChange={c => handleChange('color_high', c)} />
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* --- REACTION DIFFUSION --- */}
            {preset.type === 'reaction_diffusion' && (
                <>
                    <div style={{ background: '#222', padding: 15, borderRadius: 8, marginBottom: 15 }}>
                         <label style={LABEL_STYLE}>Colors</label>
                         <div style={{display: 'flex', gap: 20}}>
                            <div>
                                <span style={{display: 'block', marginBottom: 5, fontSize: 10, color: '#888'}}>BACKGROUND</span>
                                <ColorSwatch color={preset.color_a || '#000000'} onChange={c => handleChange('color_a', c)} />
                            </div>
                            <div>
                                <span style={{display: 'block', marginBottom: 5, fontSize: 10, color: '#888'}}>GROWTH</span>
                                <ColorSwatch color={preset.color_b || '#ffffff'} onChange={c => handleChange('color_b', c)} />
                            </div>
                         </div>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px'}}>
                        <label style={LABEL_STYLE}>Feed Rate
                            <input type="number" step="0.001" value={preset.feed} onChange={e => handleChange('feed', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Kill Rate
                            <input type="number" step="0.001" value={preset.kill} onChange={e => handleChange('kill', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Diffusion A (Du)
                            <input type="number" step="0.0001" value={preset.du} onChange={e => handleChange('du', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Diffusion B (Dv)
                            <input type="number" step="0.0001" value={preset.dv} onChange={e => handleChange('dv', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Width
                            <input type="number" value={preset.width || 64} onChange={e => handleChange('width', parseInt(e.target.value, 10))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Height
                            <input type="number" value={preset.height || 32} onChange={e => handleChange('height', parseInt(e.target.value, 10))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Steps
                            <input type="number" value={preset.steps || 8} onChange={e => handleChange('steps', parseInt(e.target.value, 10))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Zoom
                            <input type="number" step="0.1" value={preset.zoom || 1} onChange={e => handleChange('zoom', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Speed
                            <input type="number" step="0.1" value={preset.speed || 1} onChange={e => handleChange('speed', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Injection Amount
                            <input type="number" step="0.05" value={preset.injection_amount || 0} onChange={e => handleChange('injection_amount', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Injection Radius
                            <input type="number" step="0.01" value={preset.injection_radius || 0} onChange={e => handleChange('injection_radius', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Injection Decay
                            <input type="number" step="0.1" value={preset.injection_decay || 0} onChange={e => handleChange('injection_decay', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Injection History
                            <input type="number" step="0.1" value={preset.injection_history || 0} onChange={e => handleChange('injection_history', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                        </label>
                    </div>
                </>
            )}
            {/* --- REACTIVE RIPPLE --- */}
{preset.type === 'reactive_ripple' && (
    <>
        <div style={{ background: '#222', padding: 15, borderRadius: 8, marginBottom: 15 }}>
            <div style={{display: 'flex', gap: 20}}>
                <div>
                    <span style={{display: 'block', marginBottom: 5, fontSize: 10, color: '#888'}}>RIPPLE COLOR</span>
                    <ColorSwatch color={preset.color || '#00FF00'} onChange={c => handleChange('color', c)} />
                </div>
                <div>
                    <span style={{display: 'block', marginBottom: 5, fontSize: 10, color: '#888'}}>BACKGROUND</span>
                    <ColorSwatch color={preset.base_color || '#000000'} onChange={c => handleChange('base_color', c)} />
                </div>
            </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <label style={LABEL_STYLE}>Wave Speed ({preset.wave_speed})
                <input type="range" min="0.1" max="10.0" step="0.1" value={preset.wave_speed || 2.5} onChange={e => handleChange('wave_speed', parseFloat(e.target.value))} style={{width: '100%'}}/>
            </label>
            <label style={LABEL_STYLE}>Decay Time ({preset.decay_time}s)
                <input type="range" min="0.1" max="5.0" step="0.1" value={preset.decay_time || 1.5} onChange={e => handleChange('decay_time', parseFloat(e.target.value))} style={{width: '100%'}}/>
            </label>
            <label style={LABEL_STYLE}>Thickness ({preset.thickness})
                <input type="range" min="0.1" max="5.0" step="0.1" value={preset.thickness || 0.2} onChange={e => handleChange('thickness', parseFloat(e.target.value))} style={{width: '100%'}}/>
            </label>
             <label style={LABEL_STYLE}>Intensity
                <input type="number" step="0.1" value={preset.intensity || 1.0} onChange={e => handleChange('intensity', parseFloat(e.target.value))} style={INPUT_STYLE}/>
            </label>
        </div>
    </>
)}

             {/* --- STAR MATRIX --- */}
             {preset.type === 'star_matrix' && (
                <>
                     <div style={{display: 'flex', gap: 20, marginBottom: 15}}>
                        <div>
                            <span style={LABEL_STYLE}>Star Color</span>
                            <ColorSwatch color={preset.star || '#ffffff'} onChange={c => handleChange('star', c)} />
                        </div>
                        <div>
                            <span style={LABEL_STYLE}>Background</span>
                            <ColorSwatch color={preset.background || '#000000'} onChange={c => handleChange('background', c)} />
                        </div>
                     </div>
                    <label style={LABEL_STYLE}>Density ({preset.density})
                        <input type="range" min="0" max="1" step="0.05" value={preset.density || 0.2} onChange={e => handleChange('density', parseFloat(e.target.value))} style={{width: '100%'}}/>
                    </label>
                    <label style={LABEL_STYLE}>Speed ({preset.speed})
                        <input type="range" min="0" max="2" step="0.1" value={preset.speed || 0.5} onChange={e => handleChange('speed', parseFloat(e.target.value))} style={{width: '100%'}}/>
                    </label>
                </>
             )}

            {/* --- REACTIVE SETTINGS (Toggle) --- */}
            <div style={{marginTop: 30, paddingTop: 20, borderTop: '1px solid #333'}}>
                <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                    <input 
                        type="checkbox" 
                        checked={preset.reactive || false} 
                        onChange={e => handleChange('reactive', e.target.checked)}
                        style={{width: 20, height: 20, marginRight: 10}}
                    />
                    <span style={{fontWeight: 'bold', color: '#ff0e82'}}>ENABLE REACTIVE (Typing Effects)</span>
                </label>

                {preset.reactive && (
                    <div style={{paddingLeft: 30, marginTop: 12, display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap: 16}}>
                        <label style={LABEL_STYLE}>Displacement / Splash Size
                            <input type="range" min="0" max="5" step="0.1" value={preset.reactive_displacement || 1.0} onChange={e => handleChange('reactive_displacement', parseFloat(e.target.value))} style={{width: '100%'}}/>
                        </label>
                        <label style={LABEL_STYLE}>Push Enabled
                            <input type="checkbox" checked={preset.reactive_push || false} onChange={e => handleChange('reactive_push', e.target.checked)} style={{marginLeft: 10}}/>
                        </label>
                        <label style={LABEL_STYLE}>Push Duration (s)
                            <input type="number" min="0" step="0.05" value={preset.reactive_push_duration || 0.3} onChange={e => handleChange('reactive_push_duration', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                        </label>
                        <label style={LABEL_STYLE}>Phase Shift
                            <input type="number" step="0.1" value={preset.reactive_phase_shift || 0} onChange={e => handleChange('reactive_phase_shift', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                        </label>

                        <div>
                            <span style={{display:'block', marginBottom: 5, fontSize: 10, color:'#888'}}>Reactive Color</span>
                            <ColorSwatch color={preset.reactive_color || preset.color || '#00ff88'} onChange={c => handleChange('reactive_color', c)} />
                        </div>

                        <label style={LABEL_STYLE}>History
                            <input type="range" min="0" max="5" step="0.1" value={preset.reactive_history || 0} onChange={e => handleChange('reactive_history', parseFloat(e.target.value))} style={{width:'100%'}}/>
                        </label>

                        <label style={LABEL_STYLE}>Decay
                            <input type="range" min="0" max="5" step="0.1" value={preset.reactive_decay || 0} onChange={e => handleChange('reactive_decay', parseFloat(e.target.value))} style={{width:'100%'}}/>
                        </label>
                        <label style={LABEL_STYLE}>Spread
                            <input type="range" min="0" max="5" step="0.1" value={preset.reactive_spread || 0} onChange={e => handleChange('reactive_spread', parseFloat(e.target.value))} style={{width:'100%'}}/>
                        </label>
                        <label style={LABEL_STYLE}>Intensity
                            <input type="range" min="0" max="3" step="0.05" value={preset.reactive_intensity || 1} onChange={e => handleChange('reactive_intensity', parseFloat(e.target.value))} style={{width:'100%'}}/>
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}