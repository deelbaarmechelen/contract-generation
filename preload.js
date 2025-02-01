const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile')
})

// https://www.electronjs.org/docs/latest/tutorial/ipc
contextBridge.exposeInMainWorld('carbone', {
  // generateDoc: (data) => ipcRenderer.send('generateDoc', data),
  generatePdf: (data) => ipcRenderer.invoke('generatePdf', data)
})