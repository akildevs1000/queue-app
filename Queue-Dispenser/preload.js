const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadGuest: (ip) => ipcRenderer.send('load-guest', ip),
    printTicket: (pdfBase64) => ipcRenderer.send('print-ticket', pdfBase64)
});
