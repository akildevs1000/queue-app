const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadGuest: (ip) => ipcRenderer.send('load-guest', ip),
    printTicket: (pdfBase64) => ipcRenderer.send('print-ticket', pdfBase64),
    onGuestIP: (callback) => ipcRenderer.on('guest-ip', (_, data) => callback(data))
});
