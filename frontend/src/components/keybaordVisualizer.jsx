import React from 'react';

// In the future, load this from your layout.csv
// Units are in standard key units (1u = 50px approx)
const MOCK_LAYOUT = [
    { label: "Esc", x: 0, y: 0, w: 1 }, { label: "F1", x: 2, y: 0, w: 1 }, { label: "F2", x: 3, y: 0, w: 1 },
    { label: "1", x: 0, y: 1.5, w: 1 }, { label: "2", x: 1, y: 1.5, w: 1 }, { label: "W", x: 2, y: 2.5, w: 1 },
    { label: "A", x: 1.25, y: 3.5, w: 1 }, { label: "S", x: 2.25, y: 3.5, w: 1 }, { label: "D", x: 3.25, y: 3.5, w: 1 },
    { label: "Space", x: 4, y: 5.5, w: 6.25 },
    // ... Add more keys to match your physical device
];

const KEY_SIZE = 50; // pixels

export default function KeyboardVisualizer({ activeZones, activeKeys, onKeyClick }) {
    const isSelected = (label) => {
        if (activeKeys && activeKeys.includes(label)) return true;
        // Simple zone check (you would need your map of zones -> keys here)
        if (activeZones && activeZones.includes("wasd") && ["W","A","S","D"].includes(label)) return true;
        return false;
    };

    return (
        <div style={{ 
            position: 'relative', 
            width: '800px', 
            height: '300px', 
            background: '#111', 
            borderRadius: '10px',
            margin: '20px auto'
        }}>
            {MOCK_LAYOUT.map((key) => (
                <div
                    key={key.label}
                    onClick={() => onKeyClick(key.label)}
                    style={{
                        position: 'absolute',
                        left: key.x * KEY_SIZE + 10,
                        top: key.y * KEY_SIZE + 10,
                        width: (key.w * KEY_SIZE) - 4,
                        height: KEY_SIZE - 4,
                        background: isSelected(key.label) ? '#ff0e82' : '#333',
                        color: '#fff',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: isSelected(key.label) ? '0 0 10px #ff0e82' : 'none',
                        transition: 'all 0.1s'
                    }}
                >
                    {key.label}
                </div>
            ))}
        </div>
    );
}