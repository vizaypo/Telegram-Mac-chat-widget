/*
 * Telegram Widget for macOS
 * Developed by Vijay Polamarasetti
 * Contact: vizayp@icloud.com
 */

const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let controlWindow;
let tray;

function createTray() {
    // Create a simple icon from a base64 string (a small white circle or similar)
    // This is a 16x16 transparent PNG with a white dot in the middle
    const iconBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADNJREFUOE9jZGRi+s8AA0xMTEwM1AAjI6O/FKOrBhhgGjQYDIMBAwgwPgoI0DQYDIMBAgB5UxcB+uUbRwAAAABJRU5ErkJggg==';
    const icon = nativeImage.createFromDataURL(iconBase64);

    tray = new Tray(icon);
    tray.setToolTip('Telegram Widget');
    tray.setTitle(' Tw'); // Optional text next to icon

    // Toggle Control Window on Click
    tray.on('click', (event, bounds) => {
        // bounds provides x, y of the tray icon
        toggleControlWindow(bounds);
    });

    // Right click fallback to Quit
    tray.on('right-click', () => {
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Quit', click: () => app.quit() }
        ]);
        tray.popUpContextMenu(contextMenu);
    });
}

function createControlWindow() {
    controlWindow = new BrowserWindow({
        width: 250,
        height: 320,
        show: false,
        frame: false,
        resizable: false,
        alwaysOnTop: true, // Control window itself should be on top
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true, // For simple local IPC
            contextIsolation: false
        }
    });

    controlWindow.loadFile('control-center.html');

    // Hide when losing focus
    controlWindow.on('blur', () => {
        controlWindow.hide();
    });
}

function toggleControlWindow(bounds) {
    if (controlWindow.isVisible()) {
        controlWindow.hide();
    } else {
        // Calculate position
        const { x, y } = bounds; // Tray icon position
        const { width, height } = controlWindow.getBounds();

        // Position typically below the tray icon on macOS
        // macOS tray is at the top. y is roughly 22.
        // We want to center it horizontally under the icon
        const posX = Math.round(x - (width / 2));
        const posY = Math.round(y + 20); // A bit overlapping or below menu bar

        controlWindow.setPosition(posX, posY, false);
        controlWindow.show();
        controlWindow.focus();
    }
}


function createWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: 380, // Mobile-ish width
        height: 650,
        x: screenWidth - 400, // Position top-right by default
        y: 50,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            devTools: true // Keep true for debugging if needed
        },
        frame: false, // Frameless for widget look
        transparent: true, // Enable transparency
        alwaysOnTop: true, // Check request
        hasShadow: true,
        vibrancy: 'hud', // macOS vibrancy effect (try 'sidebar', 'hud', 'popover', 'under-window')
        visualEffectState: 'active',
    });

    // Load Telegram Web K (simpler UI)
    mainWindow.loadURL('https://web.telegram.org/k/', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1' });
    // Using a mobile User Agent often forces a more compact layout, good for widgets.

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createTray();
    createWindow();
    createControlWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handlers for Window Controls
ipcMain.on('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('close-window', () => {
    if (mainWindow) mainWindow.close();
});

// IPC handlers for Settings
ipcMain.on('set-always-on-top', (event, value) => {
    if (mainWindow) mainWindow.setAlwaysOnTop(value);
});

ipcMain.on('set-opacity', (event, value) => {
    if (mainWindow) mainWindow.setOpacity(parseFloat(value));
});

ipcMain.on('set-zoom', (event, value) => {
    if (mainWindow) mainWindow.webContents.setZoomFactor(parseFloat(value));
});

ipcMain.on('quit-app', () => {
    app.quit();
});
