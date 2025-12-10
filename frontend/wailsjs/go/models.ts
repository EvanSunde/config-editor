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
	    type: string;
	    color?: string;
	    colors?: string[];
	    background?: string;
	    base_color?: string;
	    star?: string;
	    tint?: string;
	    tint_mix?: number;
	    color_low?: string;
	    color_high?: string;
	    speed?: number;
	    scale?: number;
	    density?: number;
	    wave_complexity?: number;
	    mix_mode?: string;
	    octaves?: number;
	    persistence?: number;
	    lacunarity?: number;
	    drift_x?: number;
	    drift_y?: number;
	    contrast?: number;
	    wave_speed?: number;
	    decay_time?: number;
	    thickness?: number;
	    intensity?: number;
	    history?: number;
	    cooling?: number;
	    spark_chance?: number;
	    spark_intensity?: number;
	    du?: number;
	    dv?: number;
	    feed?: number;
	    kill?: number;
	    width?: number;
	    height?: number;
	    steps?: number;
	    zoom?: number;
	    reactive?: boolean;
	    reactive_displacement?: number;
	    reactive_push?: boolean;
	    reactive_phase_shift?: number;
	    reactive_push_duration?: number;
	    injection_amount?: number;
	    injection_radius?: number;
	    injection_decay?: number;
	    injection_history?: number;
	    zones?: string[];
	    keys?: string[];
	
	    static createFrom(source: any = {}) {
	        return new Layer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.color = source["color"];
	        this.colors = source["colors"];
	        this.background = source["background"];
	        this.base_color = source["base_color"];
	        this.star = source["star"];
	        this.tint = source["tint"];
	        this.tint_mix = source["tint_mix"];
	        this.color_low = source["color_low"];
	        this.color_high = source["color_high"];
	        this.speed = source["speed"];
	        this.scale = source["scale"];
	        this.density = source["density"];
	        this.wave_complexity = source["wave_complexity"];
	        this.mix_mode = source["mix_mode"];
	        this.octaves = source["octaves"];
	        this.persistence = source["persistence"];
	        this.lacunarity = source["lacunarity"];
	        this.drift_x = source["drift_x"];
	        this.drift_y = source["drift_y"];
	        this.contrast = source["contrast"];
	        this.wave_speed = source["wave_speed"];
	        this.decay_time = source["decay_time"];
	        this.thickness = source["thickness"];
	        this.intensity = source["intensity"];
	        this.history = source["history"];
	        this.cooling = source["cooling"];
	        this.spark_chance = source["spark_chance"];
	        this.spark_intensity = source["spark_intensity"];
	        this.du = source["du"];
	        this.dv = source["dv"];
	        this.feed = source["feed"];
	        this.kill = source["kill"];
	        this.width = source["width"];
	        this.height = source["height"];
	        this.steps = source["steps"];
	        this.zoom = source["zoom"];
	        this.reactive = source["reactive"];
	        this.reactive_displacement = source["reactive_displacement"];
	        this.reactive_push = source["reactive_push"];
	        this.reactive_phase_shift = source["reactive_phase_shift"];
	        this.reactive_push_duration = source["reactive_push_duration"];
	        this.injection_amount = source["injection_amount"];
	        this.injection_radius = source["injection_radius"];
	        this.injection_decay = source["injection_decay"];
	        this.injection_history = source["injection_history"];
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
	export class Effect {
	    type: string;
	    color?: string;
	    colors?: string[];
	    background?: string;
	    base_color?: string;
	    star?: string;
	    tint?: string;
	    tint_mix?: number;
	    color_low?: string;
	    color_high?: string;
	    speed?: number;
	    scale?: number;
	    density?: number;
	    wave_complexity?: number;
	    mix_mode?: string;
	    octaves?: number;
	    persistence?: number;
	    lacunarity?: number;
	    drift_x?: number;
	    drift_y?: number;
	    contrast?: number;
	    wave_speed?: number;
	    decay_time?: number;
	    thickness?: number;
	    intensity?: number;
	    history?: number;
	    cooling?: number;
	    spark_chance?: number;
	    spark_intensity?: number;
	    du?: number;
	    dv?: number;
	    feed?: number;
	    kill?: number;
	    width?: number;
	    height?: number;
	    steps?: number;
	    zoom?: number;
	    reactive?: boolean;
	    reactive_displacement?: number;
	    reactive_push?: boolean;
	    reactive_phase_shift?: number;
	    reactive_push_duration?: number;
	    injection_amount?: number;
	    injection_radius?: number;
	    injection_decay?: number;
	    injection_history?: number;
	
	    static createFrom(source: any = {}) {
	        return new Effect(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.color = source["color"];
	        this.colors = source["colors"];
	        this.background = source["background"];
	        this.base_color = source["base_color"];
	        this.star = source["star"];
	        this.tint = source["tint"];
	        this.tint_mix = source["tint_mix"];
	        this.color_low = source["color_low"];
	        this.color_high = source["color_high"];
	        this.speed = source["speed"];
	        this.scale = source["scale"];
	        this.density = source["density"];
	        this.wave_complexity = source["wave_complexity"];
	        this.mix_mode = source["mix_mode"];
	        this.octaves = source["octaves"];
	        this.persistence = source["persistence"];
	        this.lacunarity = source["lacunarity"];
	        this.drift_x = source["drift_x"];
	        this.drift_y = source["drift_y"];
	        this.contrast = source["contrast"];
	        this.wave_speed = source["wave_speed"];
	        this.decay_time = source["decay_time"];
	        this.thickness = source["thickness"];
	        this.intensity = source["intensity"];
	        this.history = source["history"];
	        this.cooling = source["cooling"];
	        this.spark_chance = source["spark_chance"];
	        this.spark_intensity = source["spark_intensity"];
	        this.du = source["du"];
	        this.dv = source["dv"];
	        this.feed = source["feed"];
	        this.kill = source["kill"];
	        this.width = source["width"];
	        this.height = source["height"];
	        this.steps = source["steps"];
	        this.zoom = source["zoom"];
	        this.reactive = source["reactive"];
	        this.reactive_displacement = source["reactive_displacement"];
	        this.reactive_push = source["reactive_push"];
	        this.reactive_phase_shift = source["reactive_phase_shift"];
	        this.reactive_push_duration = source["reactive_push_duration"];
	        this.injection_amount = source["injection_amount"];
	        this.injection_radius = source["injection_radius"];
	        this.injection_decay = source["injection_decay"];
	        this.injection_history = source["injection_history"];
	    }
	}
	export class HyprSettings {
	    enabled: boolean;
	    shortcuts_overlay_effect: Effect;
	
	    static createFrom(source: any = {}) {
	        return new HyprSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.enabled = source["enabled"];
	        this.shortcuts_overlay_effect = this.convertValues(source["shortcuts_overlay_effect"], Effect);
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
	export class DeviceInfo {
	    name: string;
	    vendor_id: number;
	    product_id: number;
	    packet_header: number[];
	    packet_length: number;
	    layout: string;
	    keycodes: string;
	    interface_usage_page: number;
	    interface_usage: number;
	    transport: string;
	    frame_interval_ms: number;
	
	    static createFrom(source: any = {}) {
	        return new DeviceInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.vendor_id = source["vendor_id"];
	        this.product_id = source["product_id"];
	        this.packet_header = source["packet_header"];
	        this.packet_length = source["packet_length"];
	        this.layout = source["layout"];
	        this.keycodes = source["keycodes"];
	        this.interface_usage_page = source["interface_usage_page"];
	        this.interface_usage = source["interface_usage"];
	        this.transport = source["transport"];
	        this.frame_interval_ms = source["frame_interval_ms"];
	    }
	}
	export class Config {
	    device: DeviceInfo;
	    hypr: HyprSettings;
	    zones: Record<string, Array<string>>;
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

