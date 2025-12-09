import React from 'react';

const KEY_SIZE = 50; // pixels

export default function KeyboardVisualizer({ layout, activeZones, activeKeys, onKeyClick }) {
    // Fallback if layout hasn't loaded yet
    if (!layout || layout.length === 0) {
        return <div style={{color: '#666', padding: 20}}>Loading Keyboard Layout...</div>;
    }

    const isSelected = (label) => {
        if (activeKeys && activeKeys.includes(label)) return true;
        // Check if the key belongs to an active zone
        // Note: You might need to pass the full 'zones' map here to do this accurately
        if (activeZones && activeZones.includes("wasd") && ["W","A","S","D"].includes(label)) return true; 
        return false;
    };

    return (
        <div style={{ 
            position: 'relative', 
            // Dynamic width based on the right-most key
            width: `${Math.max(...layout.map(k => k.x + k.w)) * KEY_SIZE + 20}px`, 
            height: `${Math.max(...layout.map(k => k.y)) * KEY_SIZE + 70}px`, 
            background: '#111', 
            borderRadius: '10px',
            margin: '20px auto',
            border: '1px solid #333'
        }}>
            {layout.map((key) => (
                <div
                    key={key.label}
                    onClick={() => onKeyClick(key.label)}
                    style={{
                        position: 'absolute',
                        left: key.x * KEY_SIZE + 10,
                        top: key.y * KEY_SIZE + 10,
                        width: (key.w * KEY_SIZE) - 4,
                        height: KEY_SIZE - 4,
                        background: isSelected(key.label) ? '#ff0e82' : '#2a2a2a',
                        color: isSelected(key.label) ? '#fff' : '#ccc',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: isSelected(key.label) ? '0 0 10px #ff0e82' : 'inset 0 -2px 0 #1a1a1a',
                        transition: 'all 0.1s'
                    }}
                >
                    {key.label}
                </div>
            ))}
        </div>
    );
}