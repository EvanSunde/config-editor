import React from 'react';

const KEY_SIZE = 50; // pixels

export default function KeyboardVisualizer({ layout, activeZones, activeKeys, onKeyClick, forcedColor }) {
    
    // Safety check for layout
    if (!layout || layout.length === 0) return <div style={{color:'#444'}}>No Layout Loaded</div>;

    const width = Math.max(...layout.map(k => k.x + k.w)) * KEY_SIZE + 20;
    const height = Math.max(...layout.map(k => k.y + k.h)) * KEY_SIZE + 20;

    const getKeyColor = (label) => {
        // 1. If we are previewing a preset, override everything
        if (forcedColor) return forcedColor;

        // 2. Otherwise check selection (for Profiles/Zones)
        if (activeKeys && activeKeys.includes(label)) return '#ff0e82';
        
        // Default Key Color
        return '#222';
    };

    return (
        <div style={{ 
            position: 'relative', 
            width: `${width}px`, 
            height: `${height}px`, 
            background: '#050505', 
            borderRadius: '10px',
            border: '1px solid #333',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
        }}>
            {layout.map((key) => {
                const bg = getKeyColor(key.label);
                return (
                    <div
                        key={key.label}
                        onClick={() => onKeyClick && onKeyClick(key.label)}
                        style={{
                            position: 'absolute',
                            left: key.x * KEY_SIZE + 10,
                            top: key.y * KEY_SIZE + 10,
                            width: (key.w * KEY_SIZE) - 4,
                            height: (key.h || 1) * KEY_SIZE - 4,
                            background: bg,
                            // Add a glow if the key is lit up (not dark grey)
                            boxShadow: bg !== '#222' ? `0 0 10px ${bg}` : 'none',
                            color: bg !== '#222' ? '#000' : '#888', // Text color logic
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            transition: 'background 0.2s, box-shadow 0.2s',
                            userSelect: 'none'
                        }}
                    >
                        {key.label}
                    </div>
                )
            })}
        </div>
    );
}