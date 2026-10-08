const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendUrl: (data) => ipcRenderer.send('load-url', data),
  resetApp: () => ipcRenderer.send('reset-app')
});
