const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path');
const carbone = require('carbone');
const fs = require('fs');

// run this as early in the main process as possible
if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
    }
  })

  win.loadFile('src/index.html')

  // Open the DevTools.
  //win.webContents.openDevTools()
}

async function handleFileOpen () {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (!canceled) {
    return filePaths[0]
  }
}

// const renderDoc = (event, data) => {
//   var options = {
//     convertTo: 'pdf'
//   };
//   var templatePath = path.join(__dirname, 'resources', 'template.odt')
//   // template file path input
//   carbone.render(templatePath, data, options, function (err, result) {
//     fs.writeFileSync('./test.pdf', result);
//   });
// }

async function handleRenderPdf (event, data) {
  // const extension = 'pdf'
  const extension = 'odt'
  var options = {
    convertTo: extension
  };
  var templatePath = path.join(__dirname, 'resources', 'template.odt')
  // template file path input
  const filePath = await carbone.render(templatePath, data, options, function (err, result) {
    if (err) {
      return console.log(err);
    }
    const pathDirectory = data.generationInfo.path.trim().length === 0 ? '.' : data.generationInfo.path
    var fileName
    if (data.contractId.trim().length === 0) {
      fileName = 'contract'
    } else {
      fileName = data.contractId
    }
    fileName += '.' + extension
    const filePath = path.join(pathDirectory, fileName)
    fs.writeFileSync(filePath, result);
    // FIXME: when converting to PDF, a 'busy' error is thrown at exit (probably from libreoffice?)
    // process.exit(); // to kill automatically LibreOffice workers
    return filePath
  });
  return filePath
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', handleFileOpen)
  //ipcMain.on('generateDoc', renderDoc)
  ipcMain.handle('generatePdf', handleRenderPdf)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  //process.exit(); // to kill automatically LibreOffice workers

  if (process.platform !== 'darwin') app.quit()    
})
