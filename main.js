/* ============================================
   NVIDIA Profile Manager Pro - Electron Main Process
   ============================================ */

const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

const PORT = process.env.PORT || 3000;
let mainWindow = null;
let serverReady = false;

// ============================================
// Start Express Server
// ============================================

function startServer() {
    return new Promise((resolve) => {
        // Set production mode for Electron builds
        if (app.isPackaged) {
            process.env.NODE_ENV = 'production';
        }

        const server = require('./server.js');

        // If server exports a promise or callback, wait for it
        if (server && server.then) {
            server.then(() => resolve());
        } else {
            // Give Express a moment to bind
            setTimeout(resolve, 500);
        }
    });
}

// ============================================
// Create Main Window
// ============================================

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 600,
        title: 'NVIDIA Profile Manager Pro',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        backgroundColor: '#1a1a2e',
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Remove default menu bar
    const menu = Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                { label: 'New Profile', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.executeJavaScript('window.app.createNewProfile()') },
                { type: 'separator' },
                { label: 'Import Profile...', click: () => mainWindow.webContents.executeJavaScript('window.app.importProfile()') },
                { label: 'Export Profile...', click: () => mainWindow.webContents.executeJavaScript('window.app.exportProfile()') },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Apply Changes', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.executeJavaScript('window.app.applyChanges()') },
                { label: 'Apply to GPU', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow.webContents.executeJavaScript('window.app.applyToGpu()') },
                { label: 'Revert Changes', accelerator: 'CmdOrCtrl+Z', click: () => mainWindow.webContents.executeJavaScript('window.app.revertChanges()') },
                { type: 'separator' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About NVIDIA Profile Manager Pro',
                    click: () => {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About',
                            message: 'NVIDIA Profile Manager Pro',
                            detail: `Version ${require('./package.json').version}\n\nManage NVIDIA GPU profiles and settings with real-time monitoring.`
                        });
                    }
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);

    // Load the app from local Express server
    mainWindow.loadURL(`http://localhost:${PORT}`);

    // Show window when content is ready (avoids white flash)
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Open external links in system browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ============================================
// App Lifecycle
// ============================================

app.whenReady().then(async () => {
    await startServer();
    serverReady = true;
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    app.quit();
});
