/*
 * Developed by Vijay Polamarasetti
 * Contact: vizayp@icloud.com
 */

const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Expose API for the renderer
contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('minimize-window'),
    close: () => ipcRenderer.send('close-window')
});

window.addEventListener('DOMContentLoaded', () => {
    // Inject Custom Styles
    const stylePath = path.join(__dirname, 'styles.css');
    fs.readFile(stylePath, 'utf8', (err, data) => {
        if (!err) {
            const style = document.createElement('style');
            style.textContent = data;
            document.head.appendChild(style);
        } else {
            console.error('Failed to read custom styles', err);
        }
    });

    // Inject Custom Title Bar
    const titleBar = document.createElement('div');
    titleBar.id = 'custom-title-bar';
    titleBar.innerHTML = `
        <div class="drag-region">Telegram Widget</div>
        <div class="window-controls">
            <button id="min-btn">_</button>
            <button id="close-btn">X</button>
        </div>
    `;
    document.body.prepend(titleBar);

    // Attach listeners
    document.getElementById('min-btn').addEventListener('click', () => {
        ipcRenderer.send('minimize-window');
    });
    document.getElementById('close-btn').addEventListener('click', () => {
        ipcRenderer.send('close-window');
    });
});
