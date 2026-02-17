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

    // Remove the menu bar completely
    Menu.setApplicationMenu(null);

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
