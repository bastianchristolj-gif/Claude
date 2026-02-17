/* ============================================
   NVIDIA Profile Manager Pro - API Client
   Connects to backend server for real GPU data
   Falls back gracefully when server is unavailable
   ============================================ */

class NvidiaAPI {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl || window.location.origin;
        this.connected = false;
        this.gpuReal = false;
        this.settingsReal = false;
        this.listeners = [];
    }

    // ============================================
    // Connection Management
    // ============================================

    async checkConnection() {
        try {
            const resp = await fetch(`${this.baseUrl}/api/status`, {
                signal: AbortSignal.timeout(3000)
            });
            if (!resp.ok) throw new Error('Bad response');
            const data = await resp.json();
            this.connected = true;
            this.gpuReal = data.gpu_available;
            this.settingsReal = data.settings_available;
            this.notify('connected', data);
            return data;
        } catch {
            this.connected = false;
            this.gpuReal = false;
            this.settingsReal = false;
            this.notify('disconnected');
            return null;
        }
    }

    on(event, callback) {
        this.listeners.push({ event, callback });
    }

    notify(event, data) {
        for (const l of this.listeners) {
            if (l.event === event) l.callback(data);
        }
    }

    // ============================================
    // GPU Information
    // ============================================

    async getGpuInfo() {
        if (!this.connected) return this.getSimulatedGpuInfo();
        try {
            const resp = await fetch(`${this.baseUrl}/api/gpu/info`);
            return await resp.json();
        } catch {
            return this.getSimulatedGpuInfo();
        }
    }

    getSimulatedGpuInfo() {
        return {
            real: false,
            name: 'NVIDIA GeForce RTX 4090',
            vram_total_gb: '24 GB GDDR6X',
            driver_version: '560.94',
            cuda_version: '12.6',
            message: 'Server not available. Showing simulated data.'
        };
    }

    // ============================================
    // GPU Monitoring (Real-time)
    // ============================================

    async getGpuMonitor() {
        if (!this.connected) return null;
        try {
            const resp = await fetch(`${this.baseUrl}/api/gpu/monitor`);
            return await resp.json();
        } catch {
            return null;
        }
    }

    async getGpuClocks() {
        if (!this.connected) return null;
        try {
            const resp = await fetch(`${this.baseUrl}/api/gpu/clocks`);
            return await resp.json();
        } catch {
            return null;
        }
    }

    async getGpuProcesses() {
        if (!this.connected) return null;
        try {
            const resp = await fetch(`${this.baseUrl}/api/gpu/processes`);
            return await resp.json();
        } catch {
            return null;
        }
    }

    // ============================================
    // GPU Settings
    // ============================================

    async getGpuSettings() {
        if (!this.connected) return { real: false, settings: {} };
        try {
            const resp = await fetch(`${this.baseUrl}/api/gpu/settings`);
            return await resp.json();
        } catch {
            return { real: false, settings: {} };
        }
    }

    async applyGpuSetting(attribute, value) {
        if (!this.connected) {
            return { real: false, applied: false, message: 'Server not connected' };
        }
        try {
            const resp = await fetch(`${this.baseUrl}/api/gpu/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attribute, value })
            });
            return await resp.json();
        } catch (err) {
            return { real: false, applied: false, error: err.message };
        }
    }

    async applySettingsBatch(settings) {
        if (!this.connected) {
            return { real: false, results: [], message: 'Server not connected' };
        }
        try {
            const resp = await fetch(`${this.baseUrl}/api/gpu/settings/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings })
            });
            return await resp.json();
        } catch (err) {
            return { real: false, results: [], error: err.message };
        }
    }

    async applyProfileToGpu(profileSettings) {
        if (!this.connected) {
            return { real: false, message: 'Server not connected' };
        }
        try {
            const resp = await fetch(`${this.baseUrl}/api/gpu/apply-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: profileSettings })
            });
            return await resp.json();
        } catch (err) {
            return { real: false, error: err.message };
        }
    }

    async getSettingMap() {
        if (!this.connected) return { mapping: {}, settings_available: false };
        try {
            const resp = await fetch(`${this.baseUrl}/api/gpu/setting-map`);
            return await resp.json();
        } catch {
            return { mapping: {}, settings_available: false };
        }
    }

    // ============================================
    // Profiles
    // ============================================

    async getProfiles() {
        if (!this.connected) return { profiles: [], source: 'local' };
        try {
            const resp = await fetch(`${this.baseUrl}/api/profiles`);
            return await resp.json();
        } catch {
            return { profiles: [], source: 'local' };
        }
    }

    async saveProfiles(profiles) {
        if (!this.connected) return { saved: false };
        try {
            const resp = await fetch(`${this.baseUrl}/api/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profiles })
            });
            return await resp.json();
        } catch {
            return { saved: false };
        }
    }

    async syncProfiles(profiles) {
        if (!this.connected) return { action: 'local_only' };
        try {
            const resp = await fetch(`${this.baseUrl}/api/profiles/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profiles })
            });
            return await resp.json();
        } catch {
            return { action: 'local_only' };
        }
    }

    // ============================================
    // Custom Presets
    // ============================================

    async getCustomPresets() {
        if (!this.connected) return { presets: {}, source: 'local' };
        try {
            const resp = await fetch(`${this.baseUrl}/api/presets`);
            return await resp.json();
        } catch {
            return { presets: {}, source: 'local' };
        }
    }

    async saveCustomPresets(presets) {
        if (!this.connected) return { saved: false };
        try {
            const resp = await fetch(`${this.baseUrl}/api/presets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ presets })
            });
            return await resp.json();
        } catch {
            return { saved: false };
        }
    }
}

// Singleton instance
window.nvidiaAPI = new NvidiaAPI();
