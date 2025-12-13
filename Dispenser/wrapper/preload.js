const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadGuest: (data) => ipcRenderer.send('load-guest', data),
    printTicket: (pdfBase64) => ipcRenderer.send('print-ticket', pdfBase64),
    onGuest: (callback) => ipcRenderer.on('guest-data', (_, data) => callback(data))
});
