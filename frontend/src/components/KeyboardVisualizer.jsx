import React, { useEffect, useMemo, useState } from 'react';

const KEY_SIZE = 50;
const ANIMATED_TYPES = new Set(['liquid_plasma', 'star_matrix', 'rainbow_wave', 'reactive_ripple']);

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex = '#000000') => {
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3
        ? normalized.split('').map((c) => c + c).join('')
        : normalized.padEnd(6, '0');
    const num = parseInt(full, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
};

const rgbToHex = ({ r, g, b }) => `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;

const mixHex = (a, b, t) => {
    const colorA = hexToRgb(a);
    const colorB = hexToRgb(b);
    return rgbToHex({
        r: Math.round(colorA.r + (colorB.r - colorA.r) * t),
        g: Math.round(colorA.g + (colorB.g - colorA.g) * t),
        b: Math.round(colorA.b + (colorB.b - colorA.b) * t)
    });
};

const paletteBlend = (palette, t) => {
    if (!palette || palette.length === 0) return '#ff0e82';
    if (palette.length === 1) return palette[0];
    const scaled = clamp(t) * (palette.length - 1);
    const idx = Math.floor(scaled);
    const next = Math.min(idx + 1, palette.length - 1);
    const localT = scaled - idx;
    return mixHex(palette[idx], palette[next], localT);
};

const hslToHex = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    return rgbToHex({ r, g, b });
};

const computeCenter = (layout) => {
    if (!layout || layout.length === 0) return { x: 0, y: 0 };
    const sum = layout.reduce((acc, key) => {
        const width = key.w || 1;
        const height = key.h || 1;
        return {
            x: acc.x + key.x + width / 2,
            y: acc.y + key.y + height / 2
        };
    }, { x: 0, y: 0 });
    return { x: sum.x / layout.length, y: sum.y / layout.length };
};

const computeAnimatedColor = (key, idx, frame, preset, palette, center) => {
    const time = frame * 0.02;
    const dx = key.x + (key.w || 1) / 2 - center.x;
    const dy = key.y + (key.h || 1) / 2 - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    switch (preset.type) {
        case 'rainbow_wave': {
            const hue = (time * 40 + key.x * 25 + key.y * 15) % 360;
            return hslToHex(hue, 85, 55);
        }
        case 'liquid_plasma': {
            const noise = Math.sin(key.x * 0.9 + time) + Math.cos(key.y * 1.1 - time * 0.7);
            const normalized = (noise + 2) / 4; // [-2,2] -> [0,1]
            return paletteBlend(palette, normalized);
        }
        case 'reactive_ripple': {
            const wave = Math.sin(distance * 1.5 - time * 3);
            const normalized = (wave + 1) / 2;
            return paletteBlend(palette, normalized);
        }
        case 'star_matrix': {
            const twinkle = (Math.sin((frame + idx * 17) * 0.25) + 1) / 2;
            const background = preset.background || '#050505';
            const star = preset.star || palette[0] || '#ffffff';
            return twinkle > 0.72 ? star : mixHex(background, star, twinkle * 0.3);
        }
        default:
            return palette[0] || '#ff0e82';
    }
};

export default function KeyboardVisualizer({ layout, keyColors = {}, preset, onKeyClick }) {

    if (!layout || layout.length === 0) return <div style={{ color: '#444' }}>No Layout Loaded</div>;

    const animated = !!(preset && ANIMATED_TYPES.has(preset.type));
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        if (!animated) return;
        let raf;
        const step = () => {
            setFrame((prev) => (prev + 1) % 60000);
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [animated]);

    useEffect(() => {
        if (!animated) setFrame(0);
    }, [animated, preset?.type]);

    const center = useMemo(() => computeCenter(layout), [layout]);
    const animatedColors = useMemo(() => {
        if (!animated) return null;
        const palette = (preset.colors && preset.colors.length > 0)
            ? preset.colors
            : [preset.color, preset.color_b, preset.star, '#ff0e82'].filter(Boolean);
        return layout.reduce((acc, key, idx) => {
            acc[key.label] = computeAnimatedColor(key, idx, frame, preset, palette, center);
            return acc;
        }, {});
    }, [animated, center, frame, layout, preset]);

    const displayColors = animatedColors || keyColors;

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
                const bg = displayColors[key.label] || '#222';
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
                            boxShadow: isLit ? `0 0 12px ${bg}` : 'none',
                            color: isLit ? '#000' : '#888',
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
                );
            })}
        </div>
    );
}