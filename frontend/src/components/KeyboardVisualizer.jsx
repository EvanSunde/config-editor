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
            const speed = (preset.speed ?? 0.8);
            const scale = (preset.scale ?? 0.5);
            const hue = (time * 40 * speed + key.x * 25 * scale + key.y * 15 * scale) % 360;
            let color = hslToHex(hue, 85, 55);
            const tintMix = preset.tint_mix ?? 0;
            if (preset.tint && tintMix > 0) color = mixHex(color, preset.tint, clamp(tintMix, 0, 1));
            return color;
        }
        case 'liquid_plasma': {
            const speed = (preset.speed ?? 0.5);
            const scale = (preset.scale ?? 1.0);
            const noise = Math.sin(key.x * (0.9 * scale) + time * speed) + Math.cos(key.y * (1.1 * scale) - time * 0.7 * speed);
            const normalized = (noise + 2) / 4; // [-2,2] -> [0,1]
            return paletteBlend(palette, normalized);
        }
        case 'reactive_ripple': {
            const ws = (preset.wave_speed ?? 2.5);
            const th = (preset.thickness ?? 0.2);
            const it = (preset.intensity ?? 1.0);
            const k = 1.5 + th * 2.0;
            const wave = Math.sin(distance * k - time * ws);
            const t = clamp(((wave + 1) / 2) * it, 0, 1);
            const base = preset.base_color || '#000000';
            const col = preset.color || palette[0] || '#00ff00';
            return mixHex(base, col, t);
        }
        case 'star_matrix': {
            const rate = 0.1 + (preset.speed ?? 0.5) * 0.5;
            const twinkle = (Math.sin((frame + idx * 17) * rate) + 1) / 2;
            const background = preset.background || '#050505';
            const star = preset.star || palette[0] || '#ffffff';
            const threshold = 1 - (preset.density ?? 0.2);
            return twinkle > threshold ? star : mixHex(background, star, twinkle * 0.3);
        }
        default:
            return palette[0] || '#ff0e82';
    }
};

export default function KeyboardVisualizer({ layout, keyColors = {}, preset, layers = [], zones = {}, onKeyClick }) {

    if (!layout || layout.length === 0) return <div style={{ color: '#444' }}>No Layout Loaded</div>;

    const usingLayers = Array.isArray(layers) && layers.length > 0;
    const anyAnimated = usingLayers ? layers.some(l => ANIMATED_TYPES.has(l.type)) : !!(preset && ANIMATED_TYPES.has(preset.type));
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        if (!anyAnimated) return;
        // Throttle to ~30 FPS for lower CPU use
        const interval = setInterval(() => {
            setFrame((prev) => (prev + 1) % 60000);
        }, 1000 / 30);
        return () => clearInterval(interval);
    }, [anyAnimated]);

    useEffect(() => {
        if (!anyAnimated) setFrame(0);
    }, [anyAnimated, preset?.type, usingLayers]);

    const center = useMemo(() => computeCenter(layout), [layout]);
    const zoneMap = zones || {};
    const coveragePriority = (layer, label) => {
        const inKeys = Array.isArray(layer.keys) && layer.keys.includes(label);
        if (inKeys) return 3;
        const inZones = Array.isArray(layer.zones) && layer.zones.some(z => (zoneMap[z] || []).includes(label));
        if (inZones) return 2;
        const isBackground = (!layer.zones || layer.zones.length === 0) && (!layer.keys || layer.keys.length === 0);
        return isBackground ? 1 : 0;
    };

    const getStaticColor = (layer) => {
        if (layer.type === 'static_color' && layer.color) return layer.color;
        if (layer.type === 'reaction_diffusion') return layer.color_b || layer.color_a || '#77ffee';
        if (layer.type === 'star_matrix') return layer.star || '#ffffff';
        if (Array.isArray(layer.colors) && layer.colors.length > 0) return layer.colors[0];
        if (layer.tint) return layer.tint;
        if (layer.base_color) return layer.base_color;
        if (layer.background) return layer.background;
        if (layer.color) return layer.color;
        return '#555';
    };

    const displayColors = useMemo(() => {
        // Layered composite path
        if (usingLayers) {
            const colorMap = {};
            const priorityMap = {};
            const indexMap = {};

            layers.forEach((layer, layerIdx) => {
                const isAnimated = ANIMATED_TYPES.has(layer.type);
                const palette = isAnimated && (layer.colors && layer.colors.length > 0)
                    ? layer.colors
                    : isAnimated ? [layer.color, layer.color_b, layer.star, layer.tint, '#ff0e82'].filter(Boolean) : null;

                layout.forEach((key, keyIdx) => {
                    const pr = coveragePriority(layer, key.label);
                    if (pr === 0) return;
                    const curPr = priorityMap[key.label] ?? -1;
                    const curIdx = indexMap[key.label] ?? -1;
                    if (pr > curPr || (pr === curPr && layerIdx >= curIdx)) {
                        const color = isAnimated
                            ? computeAnimatedColor(key, keyIdx, frame, layer, palette, center)
                            : getStaticColor(layer);
                        colorMap[key.label] = color;
                        priorityMap[key.label] = pr;
                        indexMap[key.label] = layerIdx;
                    }
                });
            });

            return colorMap;
        }

        // Single animated preset fallback
        if (preset && ANIMATED_TYPES.has(preset.type)) {
            const palette = (preset.colors && preset.colors.length > 0)
                ? preset.colors
                : [preset.color, preset.color_b, preset.star, '#ff0e82'].filter(Boolean);
            return layout.reduce((acc, key, idx) => {
                acc[key.label] = computeAnimatedColor(key, idx, frame, preset, palette, center);
                return acc;
            }, {});
        }

        // Static map fallback
        return keyColors;
    }, [usingLayers, layers, layout, frame, center, preset, keyColors, zoneMap]);

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
                            // lighter shadow for performance
                            boxShadow: isLit ? `0 0 6px ${bg}` : 'none',
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