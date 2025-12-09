import React from 'react';

const KEY_SIZE = 50; 

// Now accepts 'keyColors' map: { "Esc": "#ff0000", "W": "#00ff00" }
export default function KeyboardVisualizer({ layout, keyColors, onKeyClick }) {
    
    if (!layout || layout.length === 0) return <div style={{color:'#444'}}>No Layout Loaded</div>;

    const width = Math.max(...layout.map(k => k.x + k.w)) * KEY_SIZE + 20;
    const height = Math.max(...layout.map(k => k.y + k.h)) * KEY_SIZE + 20;

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
                // Look up specific color for this key, default to dark grey
                const bg = (keyColors && keyColors[key.label]) ? keyColors[key.label] : '#222';
                const isLit = bg !== '#222';
                
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
                            boxShadow: isLit ? `0 0 10px ${bg}` : 'none',
                            color: isLit ? '#000' : '#888',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            transition: 'background 0.2s',
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