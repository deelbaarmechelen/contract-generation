const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const https = require('https');
const path = require('path');
//const converter = require('./carbone-converter.cjs');
const log = require('electron-log');
const fs = require('node:fs');
// electron-store is ESM-only from v9 onwards. Electron 43 bundles Node 24, which
// can require() an ES module, but hands back the module namespace rather than the
// class itself -- hence the `.default`.
const Store = require('electron-store').default;

const store = new Store();

// Require `PhoneNumberFormat`.
const PNF = require('google-libphonenumber').PhoneNumberFormat;
// Get an instance of `PhoneNumberUtil`.
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const ibantools = require('ibantools');

// `quiet: true` keeps dotenv v17 from logging an "injected env" line on every
// start; v16 was silent by default and the flag restores that.
require('dotenv').config({ quiet: true });

const debugging = false;

/** Lend Engine instance the inventory lookup talks to. */
const LENDENGINE_HOST = 'digi-mee.denideal.be';

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

async function setSnipeApiKey(event, refreshToken) {
  store.set('lendengine-refresh-token', refreshToken)
  // A new refresh token invalidates whatever access token we were holding.
  accessToken = null;
  accessTokenExpiry = 0;
}

/** Lend Engine issues short-lived access tokens (about an hour) from a longer
 * lived refresh token (about a month). Only the refresh token is stored; access
 * tokens are fetched as needed and kept in memory for the rest of the session. */
let accessToken = null;
let accessTokenExpiry = 0;

/** Reads the expiry out of a JWT payload. Returns 0 when it cannot be read, so
 * the caller simply treats the token as already expired. */
function readTokenExpiry(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

/** Exchanges the stored refresh token for a fresh access token. */
function requestAccessToken() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ refresh_token: store.get('lendengine-refresh-token') });

    const req = https.request({
      hostname: LENDENGINE_HOST,
      path: '/api/2/token/refresh',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 401 || res.statusCode === 403) {
          reject(new Error('De API-sleutel is verlopen of ongeldig. Geef een nieuwe in met Ctrl + ,'));
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Kon geen toegang krijgen tot Lend Engine (foutcode ${res.statusCode}).`));
          return;
        }

        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          reject(new Error('Onleesbaar antwoord van Lend Engine bij het vernieuwen van de sleutel.'));
          return;
        }

        if (!parsed.token) {
          reject(new Error('Lend Engine gaf geen toegangssleutel terug.'));
          return;
        }

        // Lend Engine rotates the refresh token on each use, so keep the new one.
        if (parsed.refresh_token) {
          store.set('lendengine-refresh-token', parsed.refresh_token);
        }

        resolve(parsed.token);
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/** Returns a usable access token, refreshing it when it is missing or about to
 * expire. The minute of slack avoids a token expiring mid-request. */
async function getAccessToken(forceRefresh = false) {
  const stillValid = accessToken && Date.now() < accessTokenExpiry - 60000;
  if (stillValid && !forceRefresh) {
    return accessToken;
  }

  accessToken = await requestAccessToken();
  accessTokenExpiry = readTokenExpiry(accessToken);
  return accessToken;
}

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
        if (data.contractType == 'addendum') {
          const today = new Date();
          const formattedDate = formatDateYYYYMMDD(today);
          fileName += '-addendum-' + formattedDate;
        }

        fileName += '.' + extension;
        const filePath = path.join(pathDirectory, fileName);

        const pdfData = await win.webContents.printToPDF({"pageSize": "A4"});
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

function extractIbanNumber(e, rawIbanNumber) {
  return ibantools.extractIBAN(rawIbanNumber)
}

function formatIbanNumber(e, rawIbanNumber) {
  let extraction = ibantools.extractIBAN(rawIbanNumber); 
  if (!extraction.valid) {
    return ""
  }
  return ibantools.friendlyFormatIBAN(extraction.iban)
}

/** Lend Engine stores translatable strings as `{ "nl": "..." }` objects rather than
 * plain strings. Picks the Dutch value, then any other locale, so a device with only
 * an English name still fills in rather than rendering "[object Object]". */
function localisedString(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value === 'object') {
    const candidates = [value.nl, ...Object.values(value)];
    const found = candidates.find((v) => typeof v === 'string' && v.trim().length > 0);
    return found || '';
  }
  return '';
}

/** Lend Engine returns money as decimal strings ("60.00"). Returns null for
 * absent or unparseable values so callers can tell "no price set" apart from 0. */
function parseAmount(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

async function handleGetAsset(event, data) {
  console.log('Fetching asset data for tag:', data.assetTag);

  if (data.assetTag === undefined || data.assetTag === '') {
    return {
      success: false,
      error: 'Asset tag is required'
    }
  }

  if (!store.has('lendengine-refresh-token')) {
    return {
      success: false,
      error: 'Geen API-sleutel ingesteld. Geef er een in met Ctrl + ,'
    }
  }

  try {
    let item;
    try {
      item = await fetchInventoryData(data.assetTag, await getAccessToken());
    } catch (error) {
      if (!error.unauthorized) {
        throw error;
      }
      // The cached access token was rejected: refresh once and try again.
      item = await fetchInventoryData(data.assetTag, await getAccessToken(true));
    }

    console.log('Inventory data:', item);
    return {
      success: true,
      asset: {
        asset_tag: item.sku,
        brand: item.brand || '',
        model: localisedString(item.name),
        serial: item.serial || '',
        // Lend Engine is the source of truth for pricing. Sent through as
        // numbers (the API returns decimal strings like "60.00"); null means
        // the item has no price set, which the renderer reports rather than
        // silently filling in a zero.
        loanFee: parseAmount(item.loanFee),
        depositAmount: parseAmount(item.depositAmount),
      }
    };
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/** Looks an asset up in Lend Engine by its SKU (the asset tag printed on the device).
 * The collection endpoint returns a Hydra collection, so a hit is `hydra:member[0]`
 * and an unknown tag is an empty collection rather than a 404. */
function fetchInventoryData(assetTag, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: LENDENGINE_HOST,
      path: '/api/2/items?sku=' + encodeURIComponent(assetTag),
      method: 'GET',
      headers: {
        'Accept': 'application/ld+json',
        'Authorization': 'Bearer ' + token,
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
        if (res.statusCode === 401 || res.statusCode === 403) {
          // Flagged so the caller can retry once with a freshly refreshed token.
          const error = new Error('Toegang geweigerd door Lend Engine.');
          error.unauthorized = true;
          reject(error);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Request failed with status code ${res.statusCode}`));
          return;
        }

        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          reject(new Error('Could not read the response from Lend Engine'));
          return;
        }

        const members = parsed['hydra:member'] || [];
        if (members.length === 0) {
          reject(new Error('Asset not found'));
          return;
        }

        resolve(members[0]);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

/** Splits Lend Engine's single-line address into street, house number and bus.
 * Lend Engine keeps the whole address in one field while the contract form has
 * three, so the trailing number and any bus are peeled off.
 *
 * Belgians write a bus in a lot of ways, all of which turn up in practice:
 *
 *   Battelsesteenweg 48 bus 3     the official spelling
 *   Battelsesteenweg 48 bus3      without the space
 *   Battelsesteenweg 48 b 3       abbreviated, with or without a dot
 *   Battelsesteenweg 48/3         the slash form
 *   Battelsesteenweg 48 - 3       with a dash
 *   Battelsesteenweg 48A          a letter suffix, which is part of the number
 *   Battelsesteenweg 48 A         the same, written apart
 *
 * A lone trailing letter stays with the house number (48A is one number, not bus
 * A); a bus is only recognised when a separator says so. Anything unparseable is
 * left whole in the street so nothing is silently dropped. */
function splitAddress(address) {
  const empty = { streetName: '', houseNumber: '', boxNumber: '' };

  if (typeof address !== 'string' || address.trim().length === 0) {
    return empty;
  }

  const trimmed = address.trim();

  // street | house number (digits + optional letter) | separator | bus
  const withBox = trimmed.match(
    /^(.*?)\s+(\d+\s*[A-Za-z]?)\s*(?:\/|-|\s(?:bus|bs|b\.?)\s*)\s*([\dA-Za-z]+)$/i
  );
  if (withBox) {
    return {
      streetName: withBox[1].trim(),
      houseNumber: withBox[2].replace(/\s+/g, '').trim(),
      boxNumber: withBox[3].trim(),
    };
  }

  const withoutBox = trimmed.match(/^(.*?)\s+(\d+\s*[A-Za-z]?)$/);
  if (withoutBox) {
    return {
      streetName: withoutBox[1].trim(),
      houseNumber: withoutBox[2].replace(/\s+/g, '').trim(),
      boxNumber: '',
    };
  }

  return { streetName: trimmed, houseNumber: '', boxNumber: '' };
}

/** Undoes the obfuscation staff apply to email addresses in Lend Engine.
 *
 * Addresses are stored with the @ replaced (`naam_@_domein.be`, `naam_at_domein.be`)
 * so Lend Engine cannot send the client mail Digi-Mee does not want sent. The
 * contract has to show the real address, so the @ is put back here.
 *
 * Only a form that leaves exactly one @ in a plausible address is undone; anything
 * else is returned untouched, so an address that genuinely contains "_at_" in its
 * local part is not mangled. */
function deobfuscateEmail(email) {
  if (typeof email !== 'string' || email.trim().length === 0) {
    return '';
  }

  const trimmed = email.trim();
  const valid = (s) => /^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(s);

  // Tried in order; the underscore-fenced @ comes first because it is the form
  // that still contains a literal @ and so would otherwise pass for valid.
  const patterns = [
    /_+\s*@\s*_+/,          // _@_  (the @ is there but fenced off by underscores)
    /_+\s*at\s*_+/i,        // _at_
    /\(\s*at\s*\)/i,        // (at)
    /\[\s*at\s*\]/i,        // [at]
    /\s+at\s+/i,            // naam at domein.be
  ];

  for (const pattern of patterns) {
    if (!pattern.test(trimmed)) {
      continue;
    }

    const candidate = trimmed.replace(pattern, '@');

    // Accept only if the result looks like a single, complete address. This is
    // what stops "nathalie@gmail.com" being rewritten: removing the "at" there
    // does not produce a valid address, so the original stands.
    if (valid(candidate)) {
      return candidate;
    }
  }

  return trimmed;
}

/** Normalises a Belgian structured communication to the form the contract uses.
 *
 * The value is typed by hand into a Lend Engine custom field, so it turns up
 * written every which way: `+++123/4567/89012+++`, `123/4567/89012`, `***…***`,
 * with spaces, or as twelve bare digits. Only the digits carry meaning, so they
 * are the only thing read; the +++ and / are put back here.
 *
 * Returns an empty string unless there are exactly twelve digits, so a partial or
 * mistyped value is left for the user rather than filled in as though it were
 * checked. The checksum is not verified here -- the form already validates that
 * and shows the user what is wrong. */
function formatStructuredCommunication(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const digits = value.replace(/\D/g, '');
  if (digits.length !== 12) {
    return '';
  }

  return '+++' + digits.slice(0, 3) + '/' + digits.slice(3, 7) + '/' + digits.slice(7, 12) + '+++';
}

/** Lend Engine serialises an empty custom field set as `[]` (a PHP empty array)
 * and a populated one as an object keyed by the admin-facing label. Normalises
 * both to a plain object so callers can index it safely. */
function customFieldMap(customFields) {
  if (!customFields || Array.isArray(customFields)) {
    return {};
  }
  return typeof customFields === 'object' ? customFields : {};
}

/** Reads a custom field by label. The keys are display labels typed by Lend
 * Engine administrators, so a rename silently removes the value rather than
 * breaking the lookup: matching ignores case and surrounding whitespace, and a
 * miss simply yields an empty string. */
function customField(customFields, label) {
  const fields = customFieldMap(customFields);
  const wanted = label.trim().toLowerCase();

  for (const [key, value] of Object.entries(fields)) {
    if (key.trim().toLowerCase() === wanted) {
      return typeof value === 'string' ? value : '';
    }
  }

  return '';
}

/** Words that appear in the path of a Lend Engine page about a contact. */
const CONTACT_PATH_WORDS = ['contact', 'contacts', 'member', 'members', 'customer'];

/** Pulls the contact id out of what the user pasted. Accepts a Lend Engine URL
 * (the address bar of the client's page, e.g. ".../admin/contact/67") or a bare
 * id.
 *
 * A URL must name a contact somewhere in its path. Lend Engine's admin URLs for
 * items, loans and payments look the same apart from that word, and every id is
 * a valid contact id, so taking the number from any URL would quietly load an
 * unrelated client instead of failing. Returns:
 *   { id }            the contact id
 *   { error: '...' }  what was pasted, explained
 */
function parseContactRef(input) {
  const trimmed = String(input ?? '').trim();
  if (trimmed === '') {
    return { error: 'Plak de link naar de klant in Lend Engine, of typ het nummer.' };
  }

  // A bare id, possibly with a prefix like "DA-67" as used on the klantnummer.
  const bare = trimmed.match(/^[A-Za-z]*[-\s]?(\d+)$/);
  if (bare) {
    return { id: bare[1] };
  }

  const looksLikeUrl = /^https?:\/\//i.test(trimmed) || trimmed.includes('/');
  if (!looksLikeUrl) {
    return { error: 'Geen nummer gevonden. Plak de link naar de klant in Lend Engine, of typ het nummer.' };
  }

  // Only the path is considered: a query string or fragment can carry numbers
  // that have nothing to do with which record the page is about.
  let pathname;
  try {
    pathname = new URL(trimmed, 'https://' + LENDENGINE_HOST).pathname;
  } catch {
    pathname = trimmed.split(/[?#]/)[0];
  }

  const segments = pathname.split('/').filter((s) => s.length > 0);
  const wordIndex = segments.findIndex((s) => CONTACT_PATH_WORDS.includes(s.toLowerCase()));

  if (wordIndex === -1) {
    // Name the entity the link is actually about, so the mistake is obvious.
    const entity = segments.find((s) => /^[A-Za-z][A-Za-z-]*$/.test(s) && s.toLowerCase() !== 'admin');
    const what = entity ? `een "${entity}"-pagina` : 'geen klantenpagina';
    return {
      error: `Deze link wijst naar ${what}, niet naar een klant. Open de klant in Lend Engine en kopieer die link.`
    };
  }

  // The id follows the contact segment; fall back to the last number in the path
  // for shapes like /contact/67/edit where a later segment is not the id.
  const after = segments.slice(wordIndex + 1).find((s) => /^\d+$/.test(s));
  if (after) {
    return { id: after };
  }

  return {
    error: 'Geen klantnummer in deze link gevonden. Open de klant in Lend Engine en kopieer die link.'
  };
}

async function handleGetContact(event, data) {
  const ref = parseContactRef(data?.contactRef);

  if (ref.error) {
    return {
      success: false,
      error: ref.error
    };
  }

  const contactId = ref.id;

  if (!store.has('lendengine-refresh-token')) {
    return {
      success: false,
      error: 'Geen API-sleutel ingesteld. Geef er een in met Ctrl + ,'
    };
  }

  try {
    let contact;
    try {
      contact = await fetchContactData(contactId, await getAccessToken());
    } catch (error) {
      if (!error.unauthorized) {
        throw error;
      }
      contact = await fetchContactData(contactId, await getAccessToken(true));
    }

    const { streetName, houseNumber, boxNumber } = splitAddress(contact.address);

    return {
      success: true,
      contact: {
        // The klantnummer is not searchable, so it comes back from the record
        // rather than being what was typed in. It fills the Klantnummer field.
        membershipNumber: contact.membershipNumber || '',
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        streetName,
        houseNumber,
        boxNumber,
        municipality: contact.city || '',
        postalCode: contact.postcode || '',
        countryIsoCode: contact.countryIsoCode || '',
        // Staff obfuscate addresses in Lend Engine to stop it mailing clients;
        // the contract needs the real one.
        email: deobfuscateEmail(contact.email),
        phoneNumber: contact.telephone || '',
        // Hand-typed in Lend Engine, so only the digits are trusted and the
        // +++___/____/_____+++ layout is rebuilt from them.
        structuredCommunication: formatStructuredCommunication(
          customField(contact.customFields, 'Gestructureerde Mededeling')
        ),
      }
    };
  } catch (error) {
    console.error('Error fetching contact data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/** Looks a contact up in Lend Engine by its id.
 *
 * The collection endpoint only filters on email, firstName, lastName, isActive and
 * createdAt -- there is no membershipNumber filter, and API Platform silently
 * ignores unknown query parameters, so filtering on it would return page one of
 * every contact instead of an error. Fetching the single record by id keeps the
 * lookup to one request and, importantly, pulls only the one client's data onto
 * the machine rather than the whole client list. */
function fetchContactData(contactId, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: LENDENGINE_HOST,
      path: '/api/2/contacts/' + encodeURIComponent(contactId),
      method: 'GET',
      headers: {
        'Accept': 'application/ld+json',
        'Authorization': 'Bearer ' + token,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 401 || res.statusCode === 403) {
          const error = new Error('Toegang geweigerd door Lend Engine.');
          error.unauthorized = true;
          reject(error);
          return;
        }

        if (res.statusCode === 404) {
          reject(new Error(`Geen klant gevonden met nummer ${contactId}.`));
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Request failed with status code ${res.statusCode}`));
          return;
        }

        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          reject(new Error('Could not read the response from Lend Engine'));
          return;
        }

        if (!parsed || parsed.id === undefined) {
          reject(new Error('Onleesbaar antwoord van Lend Engine bij het opzoeken van de klant.'));
          return;
        }

        resolve(parsed);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

/** Opens a URL in the user's default browser.
 * Only http(s) is allowed: shell.openExternal hands the string to the OS handler,
 * so other schemes (file:, javascript:, custom app protocols) could launch local
 * programs if an attacker ever influenced this value. */
async function openExternal(e, url) {
  if (typeof url !== 'string') {
    return;
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    log.warn('Refusing to open malformed external URL:', url);
    return;
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    log.warn('Refusing to open external URL with unsupported protocol:', parsed.protocol);
    return;
  }

  shell.openExternal(parsed.href);
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', handleFileOpen);
  ipcMain.handle('generatePdf', handleRenderPdf);
  ipcMain.handle('getAsset', handleGetAsset);
  ipcMain.handle('getContact', handleGetContact);
  ipcMain.handle('formatPhoneNumber', formatPhoneNumber);
  ipcMain.handle('extractIbanNumber', extractIbanNumber);
  ipcMain.handle('formatIbanNumber', formatIbanNumber);
  ipcMain.handle('openExternal', openExternal);
  ipcMain.handle('getContractData', getContractData);
  ipcMain.handle('setSnipeApiKey', setSnipeApiKey);
  createWindow();

  app.on('activate', () => {
    log.info('activate event triggered');
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});