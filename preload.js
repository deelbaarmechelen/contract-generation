const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	openFile: () => ipcRenderer.invoke('dialog:openFile')
})

// https://www.electronjs.org/docs/latest/tutorial/ipc
contextBridge.exposeInMainWorld('carbone', {
	// generateDoc: (data) => ipcRenderer.send('generateDoc', data),
	generatePdf: (data) => ipcRenderer.invoke('generatePdf', data)
})

contextBridge.exposeInMainWorld('inventoryAPI', {
	getAssetDetails: (data) => ipcRenderer.invoke('getAsset', data)
})

contextBridge.exposeInMainWorld('libphonenumber', {
	formatPhoneNumber: (data) => ipcRenderer.invoke('formatPhoneNumber', data)
})

contextBridge.exposeInMainWorld('openExternal', {
	openExternal: (url) => ipcRenderer.invoke('openExternal', url)
})