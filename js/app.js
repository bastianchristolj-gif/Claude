/* ============================================
   NVIDIA Profile Manager Pro - Application Logic
   ============================================ */

class NvidiaProfileManager {
    constructor() {
        this.profiles = [];
        this.selectedProfile = null;
        this.modifiedSettings = {};
        this.changeLog = [];
        this.activeCategory = 'all';
        this.activeFilter = 'all';
        this.searchQuery = '';

        this.init();
    }

    init() {
        this.loadProfiles();
        this.loadCustomPresets();
        this.bindEvents();
        this.renderProfileList();
        this.updateCounts();
        this.startGpuMonitor();
        this.settingsSearch = '';
    }

    // ============================================
    // Profile Management
    // ============================================

    loadProfiles() {
        const saved = localStorage.getItem('nvidia_profiles');
        if (saved) {
            try {
                this.profiles = JSON.parse(saved);
            } catch {
                this.profiles = JSON.parse(JSON.stringify(DEFAULT_PROFILES));
            }
        } else {
            this.profiles = JSON.parse(JSON.stringify(DEFAULT_PROFILES));
        }
    }

    saveProfiles() {
        localStorage.setItem('nvidia_profiles', JSON.stringify(this.profiles));
    }

    getProfileIcon(profile) {
        const icons = {
            global: '\u2699',
            game: '\u{1F3AE}',
            application: '\u{1F4BB}'
        };
        return icons[profile.type] || '\u{1F4C4}';
    }

    getModifiedCount(profile) {
        return Object.keys(profile.settings).length;
    }

    getAllSettings() {
        const all = [];
        for (const [catKey, category] of Object.entries(NVIDIA_SETTINGS)) {
            for (const setting of category.settings) {
                all.push({ ...setting, categoryKey: catKey });
            }
        }
        return all;
    }

    getSettingById(id) {
        for (const category of Object.values(NVIDIA_SETTINGS)) {
            for (const setting of category.settings) {
                if (setting.id === id) return setting;
            }
        }
        return null;
    }

    getSettingValue(settingId) {
        if (!this.selectedProfile) return null;
        if (this.modifiedSettings.hasOwnProperty(settingId)) {
            return this.modifiedSettings[settingId];
        }
        if (this.selectedProfile.settings.hasOwnProperty(settingId)) {
            return this.selectedProfile.settings[settingId];
        }
        const setting = this.getSettingById(settingId);
        return setting ? setting.defaultValue : null;
    }

    isSettingModified(settingId) {
        if (!this.selectedProfile) return false;
        const setting = this.getSettingById(settingId);
        if (!setting) return false;

        const currentValue = this.getSettingValue(settingId);
        return currentValue !== setting.defaultValue;
    }

    isPendingChange(settingId) {
        return this.modifiedSettings.hasOwnProperty(settingId);
    }

    // ============================================
    // Rendering
    // ============================================

    renderProfileList() {
        const list = document.getElementById('profileList');
        let filteredProfiles = this.profiles;

        // Apply search filter
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            filteredProfiles = filteredProfiles.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.executable.toLowerCase().includes(q)
            );
        }

        // Apply type filter
        if (this.activeFilter === 'custom') {
            filteredProfiles = filteredProfiles.filter(p => p.isCustom);
        } else if (this.activeFilter === 'modified') {
            filteredProfiles = filteredProfiles.filter(p => Object.keys(p.settings).length > 0);
        }

        list.innerHTML = filteredProfiles.map(profile => {
            const isActive = this.selectedProfile && this.selectedProfile.id === profile.id;
            const modCount = this.getModifiedCount(profile);
            const icon = this.getProfileIcon(profile);

            let badgeHtml = '';
            if (profile.isCustom) {
                badgeHtml = '<span class="profile-item-badge custom">Custom</span>';
            } else if (modCount > 0) {
                badgeHtml = `<span class="profile-item-badge modified">${modCount}</span>`;
            }

            return `
                <li class="profile-item${isActive ? ' active' : ''}" data-id="${profile.id}">
                    <div class="profile-icon">${icon}</div>
                    <div class="profile-item-info">
                        <div class="profile-item-name">${this.escapeHtml(profile.name)}</div>
                        <div class="profile-item-meta">${this.escapeHtml(profile.executable)}</div>
                    </div>
                    ${badgeHtml}
                </li>
            `;
        }).join('');

        // Rebind profile click events
        list.querySelectorAll('.profile-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.selectProfile(id);
            });
        });
    }

    selectProfile(profileId) {
        // Warn if there are unsaved changes
        if (Object.keys(this.modifiedSettings).length > 0) {
            if (!confirm('You have unsaved changes. Discard them?')) return;
        }

        this.modifiedSettings = {};
        this.selectedProfile = this.profiles.find(p => p.id === profileId);

        if (this.selectedProfile) {
            document.getElementById('selectedProfileName').textContent = this.selectedProfile.name;
            document.getElementById('selectedProfilePath').textContent = this.selectedProfile.executable;
        }

        this.renderProfileList();
        this.renderSettings();
        this.updateCounts();
    }

    renderSettings() {
        const container = document.getElementById('settingsContent');

        if (!this.selectedProfile) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" width="64" height="64"><path fill="#555" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                    <p>Select a profile to view and edit settings</p>
                </div>
            `;
            return;
        }

        const viewMode = document.getElementById('settingViewMode').value;
        let html = '';

        for (const [catKey, category] of Object.entries(NVIDIA_SETTINGS)) {
            if (this.activeCategory !== 'all' && this.activeCategory !== catKey) continue;

            let settings = category.settings;

            // Filter by view mode
            if (viewMode === 'modified') {
                settings = settings.filter(s => this.isSettingModified(s.id));
            } else if (viewMode === 'custom') {
                settings = settings.filter(s => this.selectedProfile.settings.hasOwnProperty(s.id));
            }

            // Filter by settings search
            settings = this.filterSettingsBySearch(settings);

            if (settings.length === 0) continue;

            html += `
                <div class="setting-group" data-category="${catKey}">
                    <div class="setting-group-header">
                        <svg class="setting-group-chevron" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M7 10l5 5 5-5z"/>
                        </svg>
                        <span class="setting-group-title">${category.label}</span>
                        <span class="setting-group-count">${settings.length} settings</span>
                    </div>
                    <div class="setting-group-body">
                        ${settings.map(s => this.renderSettingRow(s)).join('')}
                    </div>
                </div>
            `;
        }

        if (!html) {
            html = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" width="48" height="48"><path fill="#555" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <p>No settings match the current filter</p>
                </div>
            `;
        }

        container.innerHTML = html;
        this.bindSettingEvents();
    }

    renderSettingRow(setting) {
        const value = this.getSettingValue(setting.id);
        const isModified = this.isSettingModified(setting.id);
        const isPending = this.isPendingChange(setting.id);
        const modifiedClass = (isModified || isPending) ? ' modified' : '';

        let controlHtml = '';

        if (setting.type === 'select') {
            const optionsHtml = setting.options.map(opt =>
                `<option value="${opt.value}"${opt.value === value ? ' selected' : ''}>${this.escapeHtml(opt.label)}</option>`
            ).join('');
            controlHtml = `<select data-setting-id="${setting.id}">${optionsHtml}</select>`;
        } else if (setting.type === 'number') {
            controlHtml = `
                <div class="range-group">
                    <input type="range" class="range-slider"
                        data-setting-id="${setting.id}"
                        min="${setting.min}" max="${setting.max}"
                        step="${setting.step}" value="${value}">
                    <span class="range-value">${value}${setting.unit || ''}</span>
                </div>
            `;
        } else if (setting.type === 'toggle') {
            controlHtml = `
                <label class="toggle-switch">
                    <input type="checkbox" data-setting-id="${setting.id}" ${value ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            `;
        }

        return `
            <div class="setting-row${modifiedClass}" data-setting-id="${setting.id}">
                <div class="setting-name">
                    <div class="setting-name-text">${this.escapeHtml(setting.name)}</div>
                    <div class="setting-name-id">${setting.id}</div>
                </div>
                <div class="setting-control">
                    ${controlHtml}
                </div>
                <button class="setting-reset-btn" data-reset-id="${setting.id}" title="Reset to default">
                    <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
                </button>
            </div>
        `;
    }

    bindSettingEvents() {
        // Group collapse/expand
        document.querySelectorAll('.setting-group-header').forEach(header => {
            header.addEventListener('click', () => {
                header.closest('.setting-group').classList.toggle('collapsed');
            });
        });

        // Select controls
        document.querySelectorAll('.setting-control select').forEach(select => {
            select.addEventListener('change', (e) => {
                const settingId = e.target.dataset.settingId;
                const newValue = parseInt(e.target.value, 10);
                this.onSettingChanged(settingId, newValue);
            });
        });

        // Range controls
        document.querySelectorAll('.setting-control input[type="range"]').forEach(range => {
            range.addEventListener('input', (e) => {
                const settingId = e.target.dataset.settingId;
                const setting = this.getSettingById(settingId);
                const newValue = parseFloat(e.target.value);
                const valueDisplay = e.target.closest('.range-group').querySelector('.range-value');
                valueDisplay.textContent = `${newValue}${setting.unit || ''}`;
            });
            range.addEventListener('change', (e) => {
                const settingId = e.target.dataset.settingId;
                const newValue = parseFloat(e.target.value);
                this.onSettingChanged(settingId, newValue);
            });
        });

        // Checkbox/toggle controls
        document.querySelectorAll('.setting-control input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const settingId = e.target.dataset.settingId;
                this.onSettingChanged(settingId, e.target.checked ? 1 : 0);
            });
        });

        // Number controls
        document.querySelectorAll('.setting-control input[type="number"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const settingId = e.target.dataset.settingId;
                this.onSettingChanged(settingId, parseFloat(e.target.value));
            });
        });

        // Reset buttons
        document.querySelectorAll('.setting-reset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const settingId = btn.dataset.resetId;
                const setting = this.getSettingById(settingId);
                if (setting) {
                    this.onSettingChanged(settingId, setting.defaultValue);
                    this.renderSettings();
                }
            });
        });

        // Hover for details
        document.querySelectorAll('.setting-row').forEach(row => {
            row.addEventListener('mouseenter', () => {
                const settingId = row.dataset.settingId;
                this.showSettingDetails(settingId);
            });
        });
    }

    onSettingChanged(settingId, newValue) {
        const setting = this.getSettingById(settingId);
        if (!setting || !this.selectedProfile) return;

        this.modifiedSettings[settingId] = newValue;

        // Update modified count
        this.updateCounts();

        // Update row style
        const row = document.querySelector(`.setting-row[data-setting-id="${settingId}"]`);
        if (row) {
            if (newValue !== setting.defaultValue) {
                row.classList.add('modified');
            } else {
                row.classList.remove('modified');
            }
        }

        // Add to changelog
        const optionLabel = setting.type === 'select'
            ? (setting.options.find(o => o.value === newValue)?.label || newValue)
            : `${newValue}${setting.unit || ''}`;

        this.addChangeLogEntry(setting.name, optionLabel);
        this.setStatus(`Modified: ${setting.name}`);
    }

    showSettingDetails(settingId) {
        const setting = this.getSettingById(settingId);
        if (!setting) return;

        const detailsEl = document.getElementById('settingDetails');
        const currentValue = this.getSettingValue(settingId);
        const isModified = this.isSettingModified(settingId);

        let valueLabel;
        if (setting.type === 'select') {
            valueLabel = setting.options.find(o => o.value === currentValue)?.label || currentValue;
        } else {
            valueLabel = `${currentValue}${setting.unit || ''}`;
        }

        let defaultLabel;
        if (setting.type === 'select') {
            defaultLabel = setting.options.find(o => o.value === setting.defaultValue)?.label || setting.defaultValue;
        } else {
            defaultLabel = `${setting.defaultValue}${setting.unit || ''}`;
        }

        detailsEl.innerHTML = `
            <div class="setting-detail-name">${this.escapeHtml(setting.name)}</div>
            <div class="setting-detail-desc">${this.escapeHtml(setting.description)}</div>
            <div class="setting-detail-info">
                <div class="setting-detail-row">
                    <span class="label">ID</span>
                    <span class="value">${setting.id}</span>
                </div>
                <div class="setting-detail-row">
                    <span class="label">Current</span>
                    <span class="value" style="${isModified ? 'color: var(--text-warning)' : ''}">${valueLabel}</span>
                </div>
                <div class="setting-detail-row">
                    <span class="label">Default</span>
                    <span class="value">${defaultLabel}</span>
                </div>
                <div class="setting-detail-row">
                    <span class="label">Category</span>
                    <span class="value">${setting.category}</span>
                </div>
            </div>
        `;
    }

    // ============================================
    // GPU Monitor (Simulated)
    // ============================================

    startGpuMonitor() {
        this.gpuState = {
            usage: 15, vram: 2.1, temp: 42, coreClock: 210,
            fan: 30, power: 45
        };
        this.updateGpuMonitor();
        this.gpuMonitorInterval = setInterval(() => this.updateGpuMonitor(), 2000);
    }

    updateGpuMonitor() {
        const s = this.gpuState;
        const hasActiveProfile = this.selectedProfile && this.selectedProfile.type === 'game';

        // Simulate realistic fluctuations
        const baseUsage = hasActiveProfile ? 72 : 15;
        const baseVram = hasActiveProfile ? 14.2 : 2.1;
        const baseTemp = hasActiveProfile ? 71 : 42;
        const baseClock = hasActiveProfile ? 2520 : 210;
        const baseFan = hasActiveProfile ? 62 : 30;
        const basePower = hasActiveProfile ? 285 : 45;

        s.usage = Math.min(100, Math.max(0, baseUsage + (Math.random() - 0.5) * 12));
        s.vram = Math.min(24, Math.max(0.5, baseVram + (Math.random() - 0.5) * 1.5));
        s.temp = Math.min(95, Math.max(30, baseTemp + (Math.random() - 0.5) * 6));
        s.coreClock = Math.max(210, baseClock + Math.round((Math.random() - 0.5) * 80));
        s.fan = Math.min(100, Math.max(25, baseFan + (Math.random() - 0.5) * 8));
        s.power = Math.min(450, Math.max(30, basePower + (Math.random() - 0.5) * 30));

        // Update bars
        const setBar = (id, pct) => {
            const el = document.getElementById(id);
            if (el) el.style.width = pct + '%';
        };

        setBar('monGpuUsage', s.usage);
        setBar('monVram', (s.vram / 24) * 100);
        setBar('monTemp', (s.temp / 95) * 100);
        setBar('monCoreClock', (s.coreClock / 2800) * 100);
        setBar('monFan', s.fan);
        setBar('monPower', (s.power / 450) * 100);

        // Update values
        const setVal = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setVal('monGpuUsageVal', Math.round(s.usage) + '%');
        setVal('monVramVal', s.vram.toFixed(1) + '/24 GB');
        setVal('monTempVal', Math.round(s.temp) + '\u00B0C');
        setVal('monCoreClockVal', Math.round(s.coreClock) + ' MHz');
        setVal('monFanVal', Math.round(s.fan) + '%');
        setVal('monPowerVal', Math.round(s.power) + 'W');

        // Temperature color coding
        const tempBar = document.getElementById('monTemp');
        if (tempBar) {
            tempBar.classList.remove('warn', 'critical');
            if (s.temp >= 85) tempBar.classList.add('critical');
            else if (s.temp >= 72) tempBar.classList.add('warn');
        }
    }

    // ============================================
    // Custom Presets
    // ============================================

    loadCustomPresets() {
        const saved = localStorage.getItem('nvidia_custom_presets');
        if (saved) {
            try {
                this.customPresets = JSON.parse(saved);
            } catch {
                this.customPresets = {};
            }
        } else {
            this.customPresets = {};
        }
    }

    saveCustomPresets() {
        localStorage.setItem('nvidia_custom_presets', JSON.stringify(this.customPresets));
    }

    saveCurrentAsPreset() {
        if (!this.selectedProfile) {
            this.showToast('Select a profile first', 'warning');
            return;
        }

        this.showModal('Save Custom Preset', `
            <div class="form-group">
                <label class="form-label">Preset Name</label>
                <input type="text" class="form-input" id="customPresetName" placeholder="e.g., My Competitive Settings">
            </div>
            <p style="color: var(--text-secondary); font-size: 11px;">This will save all current setting values (including unsaved changes) as a reusable preset.</p>
        `, [
            { label: 'Cancel', class: 'btn', action: () => this.closeModal() },
            { label: 'Save Preset', class: 'btn btn-primary', action: () => this.confirmSavePreset() }
        ]);
    }

    confirmSavePreset() {
        const name = document.getElementById('customPresetName').value.trim();
        if (!name) {
            this.showToast('Preset name is required', 'error');
            return;
        }

        const presetSettings = {};
        const allSettings = this.getAllSettings();
        for (const setting of allSettings) {
            const val = this.getSettingValue(setting.id);
            if (val !== setting.defaultValue) {
                presetSettings[setting.id] = val;
            }
        }

        const presetId = 'custom_preset_' + Date.now();
        this.customPresets[presetId] = { name, settings: presetSettings };
        this.saveCustomPresets();
        this.renderCustomPresets();
        this.closeModal();
        this.showToast(`Preset "${name}" saved`, 'success');
    }

    deleteCustomPreset(presetId) {
        const preset = this.customPresets[presetId];
        if (!preset) return;
        delete this.customPresets[presetId];
        this.saveCustomPresets();
        this.renderCustomPresets();
        this.showToast(`Preset "${preset.name}" deleted`, 'success');
    }

    applyCustomPreset(presetId) {
        if (!this.selectedProfile) {
            this.showToast('Select a profile first', 'warning');
            return;
        }
        const preset = this.customPresets[presetId];
        if (!preset) return;

        for (const [id, value] of Object.entries(preset.settings)) {
            this.modifiedSettings[id] = value;
        }

        this.renderSettings();
        this.updateCounts();
        this.showToast(`Preset "${preset.name}" applied (not yet saved)`, 'info');
        this.addChangeLogEntry('Custom Preset', preset.name);
    }

    renderCustomPresets() {
        const container = document.getElementById('customPresetList');
        if (!container) return;

        const presetIds = Object.keys(this.customPresets);
        if (presetIds.length === 0) {
            container.innerHTML = '<p class="muted" style="font-size: 11px; font-style: italic;">No custom presets saved yet</p>';
            return;
        }

        container.innerHTML = presetIds.map(id => {
            const preset = this.customPresets[id];
            const settingCount = Object.keys(preset.settings).length;
            return `
                <div class="custom-preset-item" data-preset-id="${id}">
                    <button class="preset-btn custom-preset-apply" data-custom-preset="${id}">
                        <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
                        <span class="custom-preset-name">${this.escapeHtml(preset.name)}</span>
                        <span class="custom-preset-count">${settingCount}</span>
                    </button>
                    <button class="custom-preset-delete" data-delete-preset="${id}" title="Delete preset">
                        <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                </div>
            `;
        }).join('');

        // Bind events
        container.querySelectorAll('.custom-preset-apply').forEach(btn => {
            btn.addEventListener('click', () => this.applyCustomPreset(btn.dataset.customPreset));
        });
        container.querySelectorAll('.custom-preset-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCustomPreset(btn.dataset.deletePreset);
            });
        });
    }

    // ============================================
    // Profile Comparison
    // ============================================

    showCompareDialog() {
        if (this.profiles.length < 2) {
            this.showToast('Need at least 2 profiles to compare', 'warning');
            return;
        }

        const options = this.profiles.map(p =>
            `<option value="${p.id}"${this.selectedProfile && this.selectedProfile.id === p.id ? ' selected' : ''}>${this.escapeHtml(p.name)}</option>`
        ).join('');

        const secondOptions = this.profiles.map((p, i) =>
            `<option value="${p.id}"${i === 1 ? ' selected' : ''}>${this.escapeHtml(p.name)}</option>`
        ).join('');

        this.showModal('Compare Profiles', `
            <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                <div class="form-group" style="flex:1">
                    <label class="form-label">Profile A</label>
                    <select class="form-select" id="compareProfileA">${options}</select>
                </div>
                <div class="form-group" style="flex:1">
                    <label class="form-label">Profile B</label>
                    <select class="form-select" id="compareProfileB">${secondOptions}</select>
                </div>
            </div>
            <div id="compareResult" style="max-height: 400px; overflow-y: auto;"></div>
        `, [
            { label: 'Close', class: 'btn', action: () => this.closeModal() },
            { label: 'Compare', class: 'btn btn-primary', action: () => this.runComparison() }
        ]);
    }

    runComparison() {
        const idA = document.getElementById('compareProfileA').value;
        const idB = document.getElementById('compareProfileB').value;
        const profileA = this.profiles.find(p => p.id === idA);
        const profileB = this.profiles.find(p => p.id === idB);

        if (!profileA || !profileB) return;

        const allSettings = this.getAllSettings();
        const diffs = [];

        for (const setting of allSettings) {
            const valA = profileA.settings.hasOwnProperty(setting.id) ? profileA.settings[setting.id] : setting.defaultValue;
            const valB = profileB.settings.hasOwnProperty(setting.id) ? profileB.settings[setting.id] : setting.defaultValue;

            if (valA !== valB) {
                let labelA, labelB;
                if (setting.type === 'select') {
                    labelA = setting.options.find(o => o.value === valA)?.label || valA;
                    labelB = setting.options.find(o => o.value === valB)?.label || valB;
                } else {
                    labelA = `${valA}${setting.unit || ''}`;
                    labelB = `${valB}${setting.unit || ''}`;
                }
                diffs.push({ name: setting.name, category: setting.category, labelA, labelB });
            }
        }

        const resultEl = document.getElementById('compareResult');

        if (diffs.length === 0) {
            resultEl.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">These profiles have identical settings.</p>';
            return;
        }

        resultEl.innerHTML = `
            <div class="compare-summary" style="margin-bottom: 12px; font-size: 12px; color: var(--text-secondary);">
                Found <strong style="color: var(--nvidia-green)">${diffs.length}</strong> difference${diffs.length !== 1 ? 's' : ''}
            </div>
            <table class="compare-table">
                <thead>
                    <tr>
                        <th>Setting</th>
                        <th>${this.escapeHtml(profileA.name)}</th>
                        <th>${this.escapeHtml(profileB.name)}</th>
                    </tr>
                </thead>
                <tbody>
                    ${diffs.map(d => `
                        <tr>
                            <td class="compare-setting-name">${this.escapeHtml(d.name)}</td>
                            <td class="compare-value-a">${this.escapeHtml(String(d.labelA))}</td>
                            <td class="compare-value-b">${this.escapeHtml(String(d.labelB))}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // ============================================
    // Settings Search
    // ============================================

    filterSettingsBySearch(settings) {
        if (!this.settingsSearch) return settings;
        const q = this.settingsSearch.toLowerCase();
        return settings.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q)
        );
    }

    // ============================================
    // Actions
    // ============================================

    applyChanges() {
        if (!this.selectedProfile) {
            this.showToast('No profile selected', 'warning');
            return;
        }

        if (Object.keys(this.modifiedSettings).length === 0) {
            this.showToast('No changes to apply', 'info');
            return;
        }

        // Apply modified settings to profile
        for (const [id, value] of Object.entries(this.modifiedSettings)) {
            const setting = this.getSettingById(id);
            if (setting && value === setting.defaultValue) {
                delete this.selectedProfile.settings[id];
            } else {
                this.selectedProfile.settings[id] = value;
            }
        }

        this.modifiedSettings = {};
        this.saveProfiles();
        this.renderProfileList();
        this.renderSettings();
        this.updateCounts();
        this.showToast(`Profile "${this.selectedProfile.name}" updated successfully`, 'success');
        this.setStatus('Changes applied');
    }

    revertChanges() {
        if (Object.keys(this.modifiedSettings).length === 0) {
            this.showToast('No pending changes to revert', 'info');
            return;
        }

        this.modifiedSettings = {};
        this.renderSettings();
        this.updateCounts();
        this.showToast('Changes reverted', 'info');
        this.setStatus('Changes reverted');
    }

    createNewProfile() {
        this.showModal('New Profile', `
            <div class="form-group">
                <label class="form-label">Profile Name</label>
                <input type="text" class="form-input" id="newProfileName" placeholder="e.g., My Custom Game">
            </div>
            <div class="form-group">
                <label class="form-label">Executable</label>
                <input type="text" class="form-input" id="newProfileExe" placeholder="e.g., game.exe">
            </div>
            <div class="form-group">
                <label class="form-label">Type</label>
                <select class="form-select" id="newProfileType">
                    <option value="game">Game</option>
                    <option value="application">Application</option>
                </select>
            </div>
        `, [
            { label: 'Cancel', class: 'btn', action: () => this.closeModal() },
            { label: 'Create', class: 'btn btn-primary', action: () => this.confirmNewProfile() }
        ]);
    }

    confirmNewProfile() {
        const name = document.getElementById('newProfileName').value.trim();
        const exe = document.getElementById('newProfileExe').value.trim();
        const type = document.getElementById('newProfileType').value;

        if (!name) {
            this.showToast('Profile name is required', 'error');
            return;
        }

        const id = 'custom_' + Date.now();
        const newProfile = {
            id,
            name,
            executable: exe || name.toLowerCase().replace(/\s+/g, '') + '.exe',
            type,
            isCustom: true,
            settings: {}
        };

        this.profiles.push(newProfile);
        this.saveProfiles();
        this.renderProfileList();
        this.updateCounts();
        this.closeModal();
        this.selectProfile(id);
        this.showToast(`Profile "${name}" created`, 'success');
    }

    duplicateProfile() {
        if (!this.selectedProfile) {
            this.showToast('Select a profile first', 'warning');
            return;
        }

        const id = 'custom_' + Date.now();
        const dup = {
            ...JSON.parse(JSON.stringify(this.selectedProfile)),
            id,
            name: this.selectedProfile.name + ' (Copy)',
            isCustom: true
        };

        this.profiles.push(dup);
        this.saveProfiles();
        this.renderProfileList();
        this.updateCounts();
        this.selectProfile(id);
        this.showToast(`Profile duplicated as "${dup.name}"`, 'success');
    }

    deleteProfile() {
        if (!this.selectedProfile) {
            this.showToast('Select a profile first', 'warning');
            return;
        }

        if (this.selectedProfile.id === 'base_profile') {
            this.showToast('Cannot delete the base profile', 'error');
            return;
        }

        this.showModal('Delete Profile', `
            <p style="color: var(--text-secondary); margin-bottom: 12px;">Are you sure you want to delete the profile <strong style="color: var(--text-primary)">"${this.escapeHtml(this.selectedProfile.name)}"</strong>?</p>
            <p style="color: var(--text-danger); font-size: 12px;">This action cannot be undone.</p>
        `, [
            { label: 'Cancel', class: 'btn', action: () => this.closeModal() },
            { label: 'Delete', class: 'btn btn-danger', action: () => this.confirmDelete() }
        ]);
    }

    confirmDelete() {
        const name = this.selectedProfile.name;
        this.profiles = this.profiles.filter(p => p.id !== this.selectedProfile.id);
        this.selectedProfile = null;
        this.modifiedSettings = {};
        this.saveProfiles();
        this.renderProfileList();
        this.renderSettings();
        this.updateCounts();
        this.closeModal();
        document.getElementById('selectedProfileName').textContent = 'Select a Profile';
        document.getElementById('selectedProfilePath').textContent = 'Choose a profile from the list to edit settings';
        this.showToast(`Profile "${name}" deleted`, 'success');
    }

    applyPreset(presetName) {
        if (!this.selectedProfile) {
            this.showToast('Select a profile first', 'warning');
            return;
        }

        if (presetName === 'default') {
            // Reset all to defaults
            this.modifiedSettings = {};
            for (const id of Object.keys(this.selectedProfile.settings)) {
                const setting = this.getSettingById(id);
                if (setting) {
                    this.modifiedSettings[id] = setting.defaultValue;
                }
            }
        } else {
            const preset = PRESETS[presetName];
            if (!preset) return;

            for (const [id, value] of Object.entries(preset.settings)) {
                this.modifiedSettings[id] = value;
            }
        }

        this.renderSettings();
        this.updateCounts();
        const label = presetName === 'default' ? 'Default' : PRESETS[presetName]?.name || presetName;
        this.showToast(`Preset "${label}" applied (not yet saved)`, 'info');
        this.addChangeLogEntry('Preset', label);
    }

    exportProfile() {
        if (!this.selectedProfile) {
            this.showToast('Select a profile first', 'warning');
            return;
        }

        const data = JSON.stringify(this.selectedProfile, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.selectedProfile.name.replace(/[^a-zA-Z0-9]/g, '_')}_profile.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Profile exported', 'success');
    }

    importProfile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (!data.name || !data.executable) {
                        throw new Error('Invalid profile format');
                    }

                    data.id = 'imported_' + Date.now();
                    data.isCustom = true;
                    this.profiles.push(data);
                    this.saveProfiles();
                    this.renderProfileList();
                    this.updateCounts();
                    this.selectProfile(data.id);
                    this.showToast(`Profile "${data.name}" imported`, 'success');
                } catch (err) {
                    this.showToast('Invalid profile file: ' + err.message, 'error');
                }
            };
            reader.readAsText(file);
        });
        input.click();
    }

    // ============================================
    // UI Helpers
    // ============================================

    updateCounts() {
        const profileCount = this.profiles.length;
        document.getElementById('profileCount').textContent = profileCount;
        document.getElementById('sidebarProfileCount').textContent = profileCount;

        const pendingCount = Object.keys(this.modifiedSettings).length;
        document.getElementById('modifiedCount').textContent = `${pendingCount} pending change${pendingCount !== 1 ? 's' : ''}`;
    }

    setStatus(text) {
        document.getElementById('statusText').textContent = text;
    }

    addChangeLogEntry(name, value) {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        this.changeLog.unshift({ name, value, time });
        if (this.changeLog.length > 50) this.changeLog.pop();

        const container = document.getElementById('changelog');
        container.innerHTML = this.changeLog.map(entry => `
            <div class="changelog-entry">
                <span class="changelog-dot"></span>
                <div>
                    <div class="changelog-text"><strong>${this.escapeHtml(entry.name)}</strong> \u2192 ${this.escapeHtml(String(entry.value))}</div>
                    <div class="changelog-time">${entry.time}</div>
                </div>
            </div>
        `).join('');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const icons = {
            success: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#76B900" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
            error: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#ff4757" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>',
            warning: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#ffa502" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
            info: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#0f3460" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${this.escapeHtml(message)}</span>
            <button class="toast-close">&times;</button>
        `;

        container.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        setTimeout(() => this.removeToast(toast), 4000);
    }

    removeToast(toast) {
        if (!toast.parentElement) return;
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }

    showModal(title, bodyHtml, buttons = []) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = bodyHtml;

        const footer = document.getElementById('modalFooter');
        footer.innerHTML = '';
        buttons.forEach(btn => {
            const el = document.createElement('button');
            el.className = btn.class || 'btn';
            el.textContent = btn.label;
            el.addEventListener('click', btn.action);
            footer.appendChild(el);
        });

        document.getElementById('modalOverlay').classList.add('active');
    }

    closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // Event Binding
    // ============================================

    bindEvents() {
        // Toolbar buttons
        document.getElementById('btnNewProfile').addEventListener('click', () => this.createNewProfile());
        document.getElementById('btnDuplicateProfile').addEventListener('click', () => this.duplicateProfile());
        document.getElementById('btnDeleteProfile').addEventListener('click', () => this.deleteProfile());
        document.getElementById('btnImport').addEventListener('click', () => this.importProfile());
        document.getElementById('btnExport').addEventListener('click', () => this.exportProfile());
        document.getElementById('btnApply').addEventListener('click', () => this.applyChanges());
        document.getElementById('btnRevert').addEventListener('click', () => this.revertChanges());

        // Search
        document.getElementById('profileSearch').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.renderProfileList();
        });

        // Profile filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilter = btn.dataset.filter;
                this.renderProfileList();
            });
        });

        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activeCategory = tab.dataset.category;
                this.renderSettings();
            });
        });

        // View mode
        document.getElementById('settingViewMode').addEventListener('change', () => {
            this.renderSettings();
        });

        // Expand/Collapse all
        document.getElementById('btnExpandAll').addEventListener('click', () => {
            document.querySelectorAll('.setting-group').forEach(g => g.classList.remove('collapsed'));
        });
        document.getElementById('btnCollapseAll').addEventListener('click', () => {
            document.querySelectorAll('.setting-group').forEach(g => g.classList.add('collapsed'));
        });

        // Presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyPreset(btn.dataset.preset);
            });
        });

        // Compare
        document.getElementById('btnCompare').addEventListener('click', () => this.showCompareDialog());

        // Save custom preset
        document.getElementById('btnSavePreset').addEventListener('click', () => this.saveCurrentAsPreset());

        // Settings search
        document.getElementById('settingsSearch').addEventListener('input', (e) => {
            this.settingsSearch = e.target.value;
            this.renderSettings();
        });

        // Render custom presets on load
        this.renderCustomPresets();

        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.applyChanges();
            }
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.revertChanges();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.createNewProfile();
            }
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NvidiaProfileManager();
});
