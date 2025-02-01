const { contextBridge, ipcRenderer } = require('electron');

// https://www.electronjs.org/docs/latest/tutorial/ipc
contextBridge.exposeInMainWorld('carbone', {
  // generateDoc: (data) => ipcRenderer.send('generateDoc', data),
  generatePdf: (data) => ipcRenderer.invoke('generatePdf', data)
})