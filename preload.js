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
	getAssetDetails: (data) => ipcRenderer.invoke('getAsset', data),
	setSnipeApiKey: (key) => ipcRenderer.invoke('setSnipeApiKey', key)
})

contextBridge.exposeInMainWorld('libphonenumber', {
	formatPhoneNumber: (data) => ipcRenderer.invoke('formatPhoneNumber', data)
})

contextBridge.exposeInMainWorld('ibantools', {
	extractIbanNumber: (data) => ipcRenderer.invoke('extractIbanNumber', data),
	formatIbanNumber: (data) => ipcRenderer.invoke('formatIbanNumber', data)
})

contextBridge.exposeInMainWorld('openExternal', {
	openExternal: (url) => ipcRenderer.invoke('openExternal', url)
})

contextBridge.exposeInMainWorld('contractData', {
	get: () => ipcRenderer.invoke('getContractData'),
  documentProcessed: () => ipcRenderer.invoke('document-processed'),
  documentError: (error) => ipcRenderer.invoke('document-processing-error', error)
})