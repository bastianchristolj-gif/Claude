/* ============================================
   NVIDIA Profile Manager Pro - Backend Server
   Real GPU integration via nvidia-smi / nvidia-settings
   ============================================ */

const express = require('express');
const cors = require('cors');
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const IS_PROD = process.env.NODE_ENV === 'production';
const STATIC_DIR = IS_PROD ? path.join(__dirname, 'dist') : __dirname;
app.use(express.static(STATIC_DIR));

// ============================================
// GPU Detection & Utilities
// ============================================

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const IS_WINDOWS = process.platform === 'win32';

function runCommand(cmd, timeout = 5000) {
    try {
        return execSync(cmd, { encoding: 'utf8', timeout, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    } catch {
        return null;
    }
}

function commandExists(name) {
    if (IS_WINDOWS) {
        return runCommand(`where ${name}`) !== null;
    }
    return runCommand(`which ${name}`) !== null;
}

function isNvidiaSmiAvailable() {
    return commandExists('nvidia-smi');
}

function isNvidiaSettingsAvailable() {
    // nvidia-settings is Linux-only; on Windows use nvidia-smi only
    if (IS_WINDOWS) return false;
    return commandExists('nvidia-settings');
}

const GPU_AVAILABLE = isNvidiaSmiAvailable();
const SETTINGS_AVAILABLE = isNvidiaSettingsAvailable();

console.log(`[GPU] nvidia-smi available: ${GPU_AVAILABLE}`);
console.log(`[GPU] nvidia-settings available: ${SETTINGS_AVAILABLE}`);

// ============================================
// nvidia-smi Query Helpers
// ============================================

function queryNvidiaSmi(fields) {
    const csv = runCommand(
        `nvidia-smi --query-gpu=${fields} --format=csv,noheader,nounits`
    );
    if (!csv) return null;
    return csv.split(',').map(v => v.trim());
}

function parseNvidiaSmiXml() {
    const xml = runCommand('nvidia-smi -x -q');
    if (!xml) return null;

    const extract = (tag) => {
        const match = xml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`));
        return match ? match[1].trim() : null;
    };

    const extractAll = (tag) => {
        const matches = [...xml.matchAll(new RegExp(`<${tag}>([^<]+)</${tag}>`, 'g'))];
        return matches.map(m => m[1].trim());
    };

    return { extract, extractAll, raw: xml };
}

// ============================================
// API: GET /api/status
// ============================================

app.get('/api/status', (req, res) => {
    res.json({
        server: 'NVIDIA Profile Manager Pro API',
        version: '2.1.0',
        gpu_available: GPU_AVAILABLE,
        settings_available: SETTINGS_AVAILABLE,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// API: GET /api/gpu/info
// Real GPU information via nvidia-smi
// ============================================

app.get('/api/gpu/info', (req, res) => {
    if (!GPU_AVAILABLE) {
        return res.json({
            real: false,
            name: 'NVIDIA GeForce RTX 4090',
            vram_total: '24576 MB',
            vram_total_gb: '24 GB GDDR6X',
            driver_version: '560.94',
            cuda_version: '12.6',
            gpu_uuid: 'GPU-SIMULATED-0000-0000',
            pci_bus: '0000:01:00.0',
            compute_capability: '8.9',
            architecture: 'Ada Lovelace',
            tdp: '450 W',
            message: 'nvidia-smi not detected. Showing simulated data.'
        });
    }

    try {
        const fields = [
            'name', 'memory.total', 'driver_version',
            'gpu_uuid', 'pci.bus_id', 'power.default_limit'
        ].join(',');
        const values = queryNvidiaSmi(fields);

        // Get CUDA version from nvidia-smi output
        const smiOutput = runCommand('nvidia-smi');
        const cudaMatch = smiOutput ? smiOutput.match(/CUDA Version:\s*([\d.]+)/) : null;
        const cudaVersion = cudaMatch ? cudaMatch[1] : 'N/A';

        const vramMb = parseInt(values[1]);
        const vramGb = (vramMb / 1024).toFixed(0);

        res.json({
            real: true,
            name: values[0],
            vram_total: `${values[1]} MB`,
            vram_total_gb: `${vramGb} GB`,
            driver_version: values[2],
            cuda_version: cudaVersion,
            gpu_uuid: values[3],
            pci_bus: values[4],
            tdp: values[5] ? `${values[5]} W` : 'N/A'
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to query GPU info', details: err.message });
    }
});

// ============================================
// API: GET /api/gpu/monitor
// Real-time GPU metrics via nvidia-smi
// ============================================

app.get('/api/gpu/monitor', (req, res) => {
    if (!GPU_AVAILABLE) {
        // Return simulated data with realistic fluctuations
        const sim = {
            real: false,
            gpu_utilization: Math.round(12 + Math.random() * 8),
            memory_used: (1.8 + Math.random() * 0.6).toFixed(1),
            memory_total: '24576',
            memory_used_mb: Math.round(1800 + Math.random() * 600),
            temperature: Math.round(38 + Math.random() * 8),
            fan_speed: Math.round(28 + Math.random() * 6),
            core_clock: Math.round(210 + Math.random() * 30),
            memory_clock: Math.round(405 + Math.random() * 10),
            power_draw: (42 + Math.random() * 10).toFixed(1),
            power_limit: '450.0',
            pstate: 'P8',
            message: 'Simulated data (nvidia-smi not available)'
        };
        return res.json(sim);
    }

    try {
        const fields = [
            'utilization.gpu', 'memory.used', 'memory.total',
            'temperature.gpu', 'fan.speed',
            'clocks.current.graphics', 'clocks.current.memory',
            'power.draw', 'power.limit', 'pstate'
        ].join(',');

        const values = queryNvidiaSmi(fields);
        if (!values) {
            return res.status(500).json({ error: 'nvidia-smi query returned no data' });
        }

        const memUsedMb = parseInt(values[1]);
        const memTotalMb = parseInt(values[2]);

        res.json({
            real: true,
            gpu_utilization: parseInt(values[0]),
            memory_used: (memUsedMb / 1024).toFixed(1),
            memory_total: values[2],
            memory_used_mb: memUsedMb,
            memory_total_mb: memTotalMb,
            temperature: parseInt(values[3]),
            fan_speed: parseInt(values[4]) || 0,
            core_clock: parseInt(values[5]),
            memory_clock: parseInt(values[6]),
            power_draw: values[7],
            power_limit: values[8],
            pstate: values[9]
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to query GPU monitor', details: err.message });
    }
});

// ============================================
// API: GET /api/gpu/settings
// Read current NVIDIA driver settings
// ============================================

app.get('/api/gpu/settings', (req, res) => {
    if (!SETTINGS_AVAILABLE) {
        return res.json({
            real: false,
            settings: {},
            message: 'nvidia-settings not available. Use the UI to manage virtual settings.'
        });
    }

    try {
        // Query commonly used NVIDIA attributes
        const attributes = [
            'GPUPowerMizerMode',
            'GPUFanControlState',
            'GPUTargetFanSpeed',
            'GPUCurrentClockFreqs',
            'GPUCurrentPerfLevel',
            'SyncToVBlank',
            'LogAniso',
            'FXAA',
            'FSAAMode',
            'TextureSharpen',
            'OpenGLImageSettings'
        ];

        const settings = {};
        for (const attr of attributes) {
            const val = runCommand(`nvidia-settings -q ${attr} -t 2>/dev/null`);
            if (val !== null) {
                settings[attr] = val;
            }
        }

        res.json({ real: true, settings });
    } catch (err) {
        res.status(500).json({ error: 'Failed to read settings', details: err.message });
    }
});

// ============================================
// API: POST /api/gpu/settings
// Apply NVIDIA driver settings
// ============================================

app.post('/api/gpu/settings', (req, res) => {
    const { attribute, value } = req.body;

    if (!attribute || value === undefined) {
        return res.status(400).json({ error: 'Missing attribute or value' });
    }

    // Whitelist of safe attributes to modify
    const SAFE_ATTRIBUTES = [
        'GPUPowerMizerMode',
        'GPUFanControlState',
        'GPUTargetFanSpeed',
        'SyncToVBlank',
        'LogAniso',
        'FXAA',
        'FSAAMode',
        'TextureSharpen',
        'OpenGLImageSettings',
        'AllowFlipping',
        'ShowGraphicsVisualIndicator'
    ];

    // Validate attribute name (prevent command injection)
    if (!/^[A-Za-z0-9_]+$/.test(attribute)) {
        return res.status(400).json({ error: 'Invalid attribute name' });
    }

    if (!SAFE_ATTRIBUTES.includes(attribute)) {
        return res.status(403).json({
            error: `Attribute "${attribute}" is not in the allowed list`,
            allowed: SAFE_ATTRIBUTES
        });
    }

    // Validate value (only allow integers and simple strings)
    const safeValue = String(value).replace(/[^0-9.\-]/g, '');
    if (safeValue !== String(value)) {
        return res.status(400).json({ error: 'Invalid value format' });
    }

    if (!SETTINGS_AVAILABLE) {
        return res.json({
            real: false,
            applied: false,
            attribute,
            value: safeValue,
            message: 'nvidia-settings not available. Change recorded in UI only.'
        });
    }

    try {
        const result = runCommand(
            `nvidia-settings -a "${attribute}=${safeValue}" 2>&1`
        );
        res.json({
            real: true,
            applied: true,
            attribute,
            value: safeValue,
            result: result || 'Applied successfully'
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to apply setting', details: err.message });
    }
});

// ============================================
// API: POST /api/gpu/settings/batch
// Apply multiple settings at once
// ============================================

app.post('/api/gpu/settings/batch', (req, res) => {
    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
        return res.status(400).json({ error: 'settings must be an array of {attribute, value}' });
    }

    const results = [];

    for (const { attribute, value } of settings) {
        if (!attribute || value === undefined) {
            results.push({ attribute, error: 'Missing attribute or value' });
            continue;
        }
        if (!/^[A-Za-z0-9_]+$/.test(attribute)) {
            results.push({ attribute, error: 'Invalid attribute name' });
            continue;
        }

        const safeValue = String(value).replace(/[^0-9.\-]/g, '');

        if (SETTINGS_AVAILABLE) {
            try {
                const output = runCommand(`nvidia-settings -a "${attribute}=${safeValue}" 2>&1`);
                results.push({ attribute, value: safeValue, applied: true, result: output });
            } catch (err) {
                results.push({ attribute, value: safeValue, applied: false, error: err.message });
            }
        } else {
            results.push({ attribute, value: safeValue, applied: false, message: 'nvidia-settings not available' });
        }
    }

    res.json({
        real: SETTINGS_AVAILABLE,
        results,
        applied_count: results.filter(r => r.applied).length,
        total: results.length
    });
});

// ============================================
// API: GET /api/gpu/clocks
// Detailed clock and performance data
// ============================================

app.get('/api/gpu/clocks', (req, res) => {
    if (!GPU_AVAILABLE) {
        return res.json({
            real: false,
            graphics_clock: 210,
            memory_clock: 405,
            sm_clock: 210,
            max_graphics_clock: 2520,
            max_memory_clock: 1313,
            pstate: 'P8',
            throttle_reason: 'None'
        });
    }

    try {
        const fields = [
            'clocks.current.graphics', 'clocks.current.memory', 'clocks.current.sm',
            'clocks.max.graphics', 'clocks.max.memory',
            'pstate', 'clocks_throttle_reasons.active'
        ].join(',');

        const values = queryNvidiaSmi(fields);
        if (!values) {
            return res.status(500).json({ error: 'Could not query clock data' });
        }

        res.json({
            real: true,
            graphics_clock: parseInt(values[0]),
            memory_clock: parseInt(values[1]),
            sm_clock: parseInt(values[2]),
            max_graphics_clock: parseInt(values[3]),
            max_memory_clock: parseInt(values[4]),
            pstate: values[5],
            throttle_reason: values[6] || 'None'
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to query clocks', details: err.message });
    }
});

// ============================================
// API: GET /api/gpu/processes
// List GPU processes
// ============================================

app.get('/api/gpu/processes', (req, res) => {
    if (!GPU_AVAILABLE) {
        return res.json({
            real: false,
            processes: [
                { pid: 1234, name: 'Xorg', memory: '156 MB', type: 'G' },
                { pid: 5678, name: 'gnome-shell', memory: '89 MB', type: 'G' }
            ],
            message: 'Simulated process list'
        });
    }

    try {
        const output = runCommand(
            'nvidia-smi --query-compute-apps=pid,process_name,used_gpu_memory --format=csv,noheader,nounits'
        );
        const graphicsOutput = runCommand(
            'nvidia-smi pmon -c 1 -s u 2>/dev/null'
        );

        const processes = [];
        if (output) {
            for (const line of output.split('\n')) {
                const parts = line.split(',').map(p => p.trim());
                if (parts.length >= 3) {
                    processes.push({
                        pid: parseInt(parts[0]),
                        name: parts[1],
                        memory: `${parts[2]} MB`,
                        type: 'C'
                    });
                }
            }
        }

        res.json({ real: true, processes });
    } catch (err) {
        res.status(500).json({ error: 'Failed to query processes', details: err.message });
    }
});

// ============================================
// API: Profiles CRUD (file-based)
// ============================================

const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

function loadProfilesFromDisk() {
    try {
        if (fs.existsSync(PROFILES_FILE)) {
            return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf8'));
        }
    } catch {}
    return null;
}

function saveProfilesToDisk(profiles) {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2));
}

app.get('/api/profiles', (req, res) => {
    const profiles = loadProfilesFromDisk();
    res.json({
        profiles: profiles || [],
        source: profiles ? 'server' : 'empty',
        message: profiles ? 'Loaded from server storage' : 'No profiles on server. Client will use localStorage.'
    });
});

app.post('/api/profiles', (req, res) => {
    const { profiles } = req.body;
    if (!profiles || !Array.isArray(profiles)) {
        return res.status(400).json({ error: 'profiles must be an array' });
    }
    saveProfilesToDisk(profiles);
    res.json({ saved: true, count: profiles.length });
});

app.post('/api/profiles/sync', (req, res) => {
    const { profiles } = req.body;
    if (!profiles || !Array.isArray(profiles)) {
        return res.status(400).json({ error: 'profiles must be an array' });
    }

    const existing = loadProfilesFromDisk();
    if (!existing) {
        saveProfilesToDisk(profiles);
        return res.json({ action: 'server_created', count: profiles.length });
    }

    // Merge: client profiles take priority for custom ones
    const merged = [...existing];
    for (const clientProfile of profiles) {
        const idx = merged.findIndex(p => p.id === clientProfile.id);
        if (idx >= 0) {
            if (clientProfile.isCustom) {
                merged[idx] = clientProfile;
            }
        } else {
            merged.push(clientProfile);
        }
    }

    saveProfilesToDisk(merged);
    res.json({ action: 'merged', count: merged.length, profiles: merged });
});

// ============================================
// API: Custom Presets CRUD
// ============================================

const PRESETS_FILE = path.join(DATA_DIR, 'custom_presets.json');

app.get('/api/presets', (req, res) => {
    try {
        if (fs.existsSync(PRESETS_FILE)) {
            const presets = JSON.parse(fs.readFileSync(PRESETS_FILE, 'utf8'));
            return res.json({ presets, source: 'server' });
        }
    } catch {}
    res.json({ presets: {}, source: 'empty' });
});

app.post('/api/presets', (req, res) => {
    const { presets } = req.body;
    if (!presets || typeof presets !== 'object') {
        return res.status(400).json({ error: 'presets must be an object' });
    }
    fs.writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
    res.json({ saved: true, count: Object.keys(presets).length });
});

// ============================================
// API: nvidia-settings attribute mapping
// Maps our UI setting IDs to nvidia-settings attributes
// ============================================

const SETTING_ID_TO_NVIDIA_ATTR = {
    '0x00A879CF': { attr: 'SyncToVBlank', transform: (v) => v === 2 ? 1 : 0 },
    '0x1057EB71': { attr: 'LogAniso', transform: (v) => Math.log2(Math.max(v, 1)) },
    '0x00D23456': { attr: 'FXAA', transform: (v) => v },
    '0x00741142': { attr: 'FSAAMode', transform: (v) => v },
    '0x0040AB89': { attr: 'GPUPowerMizerMode', transform: (v) => v === 2 ? 1 : 0 },
    '0x10F9DC81': { attr: 'OpenGLImageSettings', transform: (v) => v },
    '0x008EF456': { attr: 'GPUFanControlState', transform: (v) => v }
};

app.get('/api/gpu/setting-map', (req, res) => {
    res.json({
        mapping: SETTING_ID_TO_NVIDIA_ATTR,
        settings_available: SETTINGS_AVAILABLE,
        description: 'Maps UI setting IDs to nvidia-settings attributes'
    });
});

app.post('/api/gpu/apply-profile', (req, res) => {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'settings must be an object {settingId: value}' });
    }

    const results = [];
    let appliedCount = 0;

    for (const [settingId, value] of Object.entries(settings)) {
        const mapping = SETTING_ID_TO_NVIDIA_ATTR[settingId];
        if (!mapping) {
            results.push({ settingId, mapped: false, message: 'No nvidia-settings mapping' });
            continue;
        }

        const nvidiaValue = mapping.transform(value);
        const attr = mapping.attr;

        if (SETTINGS_AVAILABLE) {
            try {
                const output = runCommand(`nvidia-settings -a "${attr}=${nvidiaValue}" 2>&1`);
                results.push({ settingId, attr, value: nvidiaValue, applied: true, output });
                appliedCount++;
            } catch (err) {
                results.push({ settingId, attr, value: nvidiaValue, applied: false, error: err.message });
            }
        } else {
            results.push({ settingId, attr, value: nvidiaValue, applied: false, reason: 'nvidia-settings not available' });
        }
    }

    res.json({
        real: SETTINGS_AVAILABLE,
        results,
        applied_count: appliedCount,
        total: Object.keys(settings).length,
        unmapped: results.filter(r => !r.mapped && r.mapped === false).length
    });
});

// ============================================
// Serve frontend
// ============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// ============================================
// Start Server
// ============================================

const serverInstance = app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  NVIDIA Profile Manager Pro API`);
    console.log(`  Running on http://localhost:${PORT}`);
    console.log(`  GPU detected: ${GPU_AVAILABLE}`);
    console.log(`  nvidia-settings: ${SETTINGS_AVAILABLE}`);
    console.log(`========================================\n`);
});

// Export for Electron integration
module.exports = serverInstance;
