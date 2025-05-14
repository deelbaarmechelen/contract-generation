const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const https = require('https');
const path = require('path');
const converter = require('./node_modules/carbone/lib/converter');
//const converter = require('./carbone-converter.cjs');
const log = require('electron-log');
const fs = require('node:fs');

// Require `PhoneNumberFormat`.
const PNF = require('google-libphonenumber').PhoneNumberFormat;
// Get an instance of `PhoneNumberUtil`.
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

require('dotenv').config();

const debugging = false;

// Optional, initialize the logger for any renderer process
log.initialize();

log.info('Starting contract generator');

// run this as early in the main process as possible
if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('src/index.html');

  win.on('closed', () => app.quit())

  // Open the DevTools.
  // win.webContents.openDevTools();
};

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (!canceled) {
    return filePaths[0];
  }
}

let contractData;

async function getContractData() {
  return contractData;
}

async function handleRenderPdf(event, data) {
  contractData = data;

  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      width: 1280,
      height: 720,
      autoHideMenuBar: true,
      show: debugging,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    async function documentProcessedListener() {
      ipcMain.removeHandler('document-processing-error');
      try {
        const extension = 'pdf';
        const pdfPath = await handleFileOpen();
        const pathDirectory = pdfPath.trim().length === 0 ? '.' : pdfPath;

        let fileName = data.contractNumber.trim().length === 0 ? 'contract' : data.contractNumber;
        if (data.isExtension) {
          const today = new Date();
          const formattedDate = formatDateYYYYMMDD(today);
          fileName += '-addendum-' + formattedDate;
        }

        fileName += '.' + extension;
        const filePath = path.join(pathDirectory, fileName);

        const pdfData = await win.webContents.printToPDF({});
        await fs.promises.writeFile(filePath, pdfData);

        console.log(`Wrote PDF successfully to ${filePath}`);
        if (!debugging) {
          win.close();
        }
        shell.openPath(filePath);
        resolve(filePath);
      } catch (error) {
        console.error('Failed to generate PDF:', error);
        if (!debugging) {
          win.close();
        }
        reject(error);
      }
    }

    ipcMain.handleOnce('document-processed', documentProcessedListener);

    async function documentErrorListener(event, error) {
      ipcMain.removeHandler('document-processed');
      console.error('Failed to generate PDF due to error in contract.html:', error);
        if (!debugging) {
          win.close();
        }
      reject(error);
    }

    ipcMain.handleOnce('document-processing-error', documentErrorListener);

    if (data.contractType == "addendum") {
      win.loadFile('src/contract/addendum.html');
    } else {
      win.loadFile('src/contract/contract.html');
    }

    win.webContents.on('did-fail-load', (error) => {
      if (!debugging) {
        win.close();
      }
      reject(new Error(`Failed to load contract window: ${error}`));
    });
  });
}

function formatDateYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2); // Add leading zero if needed
  const day = ('0' + date.getDate()).slice(-2); // Add leading zero if needed
  return `${year}${month}${day}`;
}

/** Validates and formats phone numbers, according to standard Belgian formatting.
 * If invalid, returns empty string. If valid, returns formatted phone number.*/
function formatPhoneNumber(e, rawPhoneNumber) {
  let phoneNumber;

  try {
    phoneNumber = phoneUtil.parse(rawPhoneNumber, 'BE');
  } catch {
    return ""
  }

  if (!phoneUtil.isValidNumber(phoneNumber)) {
    return ""
  }

  if (phoneUtil.isValidNumberForRegion(phoneNumber, "BE")) {
    return phoneUtil.format(phoneNumber, PNF.NATIONAL)
  } else {
    return phoneUtil.format(phoneNumber, PNF.INTERNATIONAL)
  }
}

async function handleGetAsset(event, data) {
  console.log('Fetching asset data for tag:', data.assetTag);

  if (data.assetTag === undefined || data.assetTag === '') {
    return {
      success: false,
      error: 'Asset tag is required'
    }
  }

  if (!process.env.INVENTORY_API_KEY) {
    return {
      success: false,
      error: 'Please configure API key'
    }
  }

  return fetchInventoryData(data.assetTag)
    .then((data) => {
      console.log('Inventory data:', data);
      return {
        success: true,
        asset: {
          asset_tag: data.asset_tag,
          brand: data.manufacturer.name,
          model: data.model_number,
          serial: data.serial,
        }
      };
    })
    .catch((error) => {
      console.error('Error fetching inventory data:', error);
      return {
        success: false,
        error: error.message
      }
    });
}

function fetchInventoryData(assetTag) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: process.env.INVENTORY_API_HOST,
      path: '/api/v1/hardware/bytag/' + assetTag,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.INVENTORY_API_KEY,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      // A chunk of data has been received.
      res.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received.
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else if (res.statusCode === 404) {
          reject(new Error('Asset not found'));
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function openExternal(e, url) {
  console.log(url);
  shell.openExternal(url);
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', handleFileOpen);
  ipcMain.handle('generatePdf', handleRenderPdf);
  ipcMain.handle('getAsset', handleGetAsset);
  ipcMain.handle('formatPhoneNumber', formatPhoneNumber);
  ipcMain.handle('openExternal', openExternal);
  ipcMain.handle('getContractData', getContractData);
  createWindow();

  app.on('activate', () => {
    log.info('activate event triggered');
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // FIXME: when converting to PDF, a 'busy' error is thrown at exit (probably from libreoffice?)
  //process.exit(); // to kill automatically LibreOffice workers

  if (process.platform !== 'darwin') {
    try {
      converter.exit(() => {
        log.info('Carbone converter exited');
        log.info('Quitting contract generator');
        app.quit();
      });
    } catch (err) {
      log.error('Error closing Carbone:', err);
    }
  }
});
