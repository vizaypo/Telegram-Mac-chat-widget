/*
 * Developed by Vijay Polamarasetti
 * Contact: vizayp@icloud.com
 */

const { ipcRenderer } = require('electron');

const alwaysOnTopCheckbox = document.getElementById('alwaysOnTop');
const opacityRange = document.getElementById('opacityRange');
const opacityValue = document.getElementById('opacityValue');
const zoomRange = document.getElementById('zoomRange');
const zoomValue = document.getElementById('zoomValue');
const quitBtn = document.getElementById('quitBtn');

// Send updates to main process
alwaysOnTopCheckbox.addEventListener('change', (e) => {
    ipcRenderer.send('set-always-on-top', e.target.checked);
});

opacityRange.addEventListener('input', (e) => {
    const val = e.target.value;
    opacityValue.innerText = val + '%';
    ipcRenderer.send('set-opacity', val / 100);
});

zoomRange.addEventListener('input', (e) => {
    const val = e.target.value;
    zoomValue.innerText = val + '%';
    ipcRenderer.send('set-zoom', val / 100);
});

quitBtn.addEventListener('click', () => {
    ipcRenderer.send('quit-app');
});

// Optionally, listen for initial state if we wanted to sync (skipped for simplicity, defaults are assumed)
