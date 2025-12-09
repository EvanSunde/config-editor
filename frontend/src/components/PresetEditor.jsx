import React from 'react';

const INPUT_STYLE = { padding: '8px', margin: '5px', background: '#222', color: '#fff', border: '1px solid #444' };
const LABEL_STYLE = { display: 'block', margin: '10px 0', fontSize: '14px', color: '#aaa' };

export default function PresetEditor({ preset, onChange }) {
    if (!preset) return <div style={{padding: 20}}>Select a preset to edit</div>;

    const handleChange = (field, value) => {
        onChange({ ...preset, [field]: value });
    };

    const renderCommonFields = () => (
        <>
            <label style={LABEL_STYLE}>Effect Type
                <select 
                    style={{...INPUT_STYLE, width: '100%'}}
                    value={preset.type} 
                    onChange={e => handleChange('type', e.target.value)}
                >
                    <option value="static_color">Static Color</option>
                    <option value="liquid_plasma">Liquid Plasma</option>
                    <option value="reaction_diffusion">Reaction Diffusion</option>
                    <option value="star_matrix">Star Matrix</option>
                    <option value="smoke">Smoke</option>
                </select>
            </label>
        </>
    );

    return (
        <div style={{ padding: '20px', background: '#1a1a1a', height: '100%', overflowY: 'auto' }}>
            <h2 style={{borderBottom: '1px solid #ff0e82', paddingBottom: '10px'}}>Edit Preset</h2>
            {renderCommonFields()}

            {/* STATIC COLOR */}
            {preset.type === 'static_color' && (
                <label style={LABEL_STYLE}>Color
                    <input type="color" value={preset.color || '#ffffff'} onChange={e => handleChange('color', e.target.value)} style={{marginLeft: 10}}/>
                </label>
            )}

            {/* FLUID / PLASMA */}
            {['liquid_plasma', 'smoke'].includes(preset.type) && (
                <>
                    <label style={LABEL_STYLE}>Speed ({preset.speed})
                        <input type="range" min="0" max="2" step="0.1" value={preset.speed || 0.5} onChange={e => handleChange('speed', parseFloat(e.target.value))} style={{width: '100%'}}/>
                    </label>
                    <label style={LABEL_STYLE}>Scale ({preset.scale})
                        <input type="range" min="0.1" max="5" step="0.1" value={preset.scale || 1.0} onChange={e => handleChange('scale', parseFloat(e.target.value))} style={{width: '100%'}}/>
                    </label>
                    
                    {/* Color Array Management */}
                    <div style={{marginTop: 15}}>
                        <span style={LABEL_STYLE}>Colors Palette</span>
                        <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                            {(preset.colors || []).map((col, idx) => (
                                <input 
                                    key={idx} type="color" value={col} 
                                    onChange={(e) => {
                                        const newColors = [...preset.colors];
                                        newColors[idx] = e.target.value;
                                        handleChange('colors', newColors);
                                    }}
                                />
                            ))}
                            <button onClick={() => handleChange('colors', [...(preset.colors || []), "#ffffff"])} style={INPUT_STYLE}>+</button>
                            <button onClick={() => handleChange('colors', preset.colors?.slice(0, -1))} style={INPUT_STYLE}>-</button>
                        </div>
                    </div>
                </>
            )}

            {/* REACTION DIFFUSION */}
            {preset.type === 'reaction_diffusion' && (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                    <label style={LABEL_STYLE}>Feed
                        <input type="number" step="0.001" value={preset.feed} onChange={e => handleChange('feed', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                    </label>
                    <label style={LABEL_STYLE}>Kill
                        <input type="number" step="0.001" value={preset.kill} onChange={e => handleChange('kill', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                    </label>
                    <label style={LABEL_STYLE}>Du
                        <input type="number" step="0.0001" value={preset.du} onChange={e => handleChange('du', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                    </label>
                    <label style={LABEL_STYLE}>Dv
                        <input type="number" step="0.0001" value={preset.dv} onChange={e => handleChange('dv', parseFloat(e.target.value))} style={INPUT_STYLE}/>
                    </label>
                </div>
            )}
        </div>
    );
}