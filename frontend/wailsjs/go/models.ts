export namespace main {
	
	export class AppConfig {
	    default_profile: string;
	    default_shortcut: string;
	    mappings: Record<string, any>;
	
	    static createFrom(source: any = {}) {
	        return new AppConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.default_profile = source["default_profile"];
	        this.default_shortcut = source["default_shortcut"];
	        this.mappings = source["mappings"];
	    }
	}
	export class Shortcut {
	    color?: string;
	    ctrl?: string[];
	    shift?: string[];
	    alt?: string[];
	    win?: string[];
	    ctrl_shift?: string[];
	
	    static createFrom(source: any = {}) {
	        return new Shortcut(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.color = source["color"];
	        this.ctrl = source["ctrl"];
	        this.shift = source["shift"];
	        this.alt = source["alt"];
	        this.win = source["win"];
	        this.ctrl_shift = source["ctrl_shift"];
	    }
	}
	export class Layer {
	    preset: string;
	    zones?: string[];
	    keys?: string[];
	
	    static createFrom(source: any = {}) {
	        return new Layer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.preset = source["preset"];
	        this.zones = source["zones"];
	        this.keys = source["keys"];
	    }
	}
	export class Profile {
	    layers: Layer[];
	
	    static createFrom(source: any = {}) {
	        return new Profile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.layers = this.convertValues(source["layers"], Layer);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Preset {
	    type: string;
	    color?: string;
	    colors?: string[];
	    background?: string;
	    tint?: string;
	    tint_mix?: number;
	    speed?: number;
	    scale?: number;
	    density?: number;
	    wave_complexity?: number;
	    du?: number;
	    dv?: number;
	    feed?: number;
	    kill?: number;
	    reactive?: boolean;
	    reactive_displacement?: number;
	    reactive_push?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Preset(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.color = source["color"];
	        this.colors = source["colors"];
	        this.background = source["background"];
	        this.tint = source["tint"];
	        this.tint_mix = source["tint_mix"];
	        this.speed = source["speed"];
	        this.scale = source["scale"];
	        this.density = source["density"];
	        this.wave_complexity = source["wave_complexity"];
	        this.du = source["du"];
	        this.dv = source["dv"];
	        this.feed = source["feed"];
	        this.kill = source["kill"];
	        this.reactive = source["reactive"];
	        this.reactive_displacement = source["reactive_displacement"];
	        this.reactive_push = source["reactive_push"];
	    }
	}
	export class HyprSettings {
	    enabled: boolean;
	    shortcuts_overlay_preset: string;
	
	    static createFrom(source: any = {}) {
	        return new HyprSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.enabled = source["enabled"];
	        this.shortcuts_overlay_preset = source["shortcuts_overlay_preset"];
	    }
	}
	export class DeviceInfo {
	    name: string;
	    packet_header: number[];
	    layout: string;
	
	    static createFrom(source: any = {}) {
	        return new DeviceInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.packet_header = source["packet_header"];
	        this.layout = source["layout"];
	    }
	}
	export class Config {
	    device: DeviceInfo;
	    hypr: HyprSettings;
	    zones: Record<string, Array<string>>;
	    presets: Record<string, Preset>;
	    profiles: Record<string, Profile>;
	    apps: AppConfig;
	    shortcuts: Record<string, Shortcut>;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.device = this.convertValues(source["device"], DeviceInfo);
	        this.hypr = this.convertValues(source["hypr"], HyprSettings);
	        this.zones = source["zones"];
	        this.presets = this.convertValues(source["presets"], Preset, true);
	        this.profiles = this.convertValues(source["profiles"], Profile, true);
	        this.apps = this.convertValues(source["apps"], AppConfig);
	        this.shortcuts = this.convertValues(source["shortcuts"], Shortcut, true);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class KeyLayout {
	    label: string;
	    x: number;
	    y: number;
	    w: number;
	    h: number;
	
	    static createFrom(source: any = {}) {
	        return new KeyLayout(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.label = source["label"];
	        this.x = source["x"];
	        this.y = source["y"];
	        this.w = source["w"];
	        this.h = source["h"];
	    }
	}
	
	
	

}

