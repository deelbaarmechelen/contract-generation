# contract-generation

Small application to generate contracts digitally, built with ElectronJS.

## How contracts are generated

The form in `src/index.html` collects the contract data. On submit, the data is
sent to the main process, which opens a hidden `BrowserWindow` on
`src/contract/contract.html` (or `src/contract/addendum.html` for addendums),
fills it in, and exports it with Electron's `webContents.printToPDF`.

Contracts are therefore plain HTML + CSS: to change how a contract looks, edit
`src/contract/contract.html` and `src/contract/style.css`.

> Earlier versions intended to use [carbone](https://carbone.io/) with the
> `.odt` templates in `resources/`. That approach was abandoned — carbone is not
> a dependency, and those templates are no longer used by the application. They
> are kept only as a reference for the wording of the paper contracts.

## Running

```sh
npm install
npm start              # run the app
npm test               # run the unit tests
npm run make           # build a distributable
```

Requires Node 22.12 or newer (the app depends on Electron 43 / Node 24 to
`require()` the ESM-only `electron-store`).

## Inventory lookup (Snipe-IT)

The asset-tag lookup calls the Snipe-IT API at `inventaris.digibankmechelen.be`.
It needs an API key, set from within the app via the settings dialog; the key is
stored with `electron-store` in the user's app-data directory, not in the repo.
Without a key the rest of the application still works — only the
autofill-from-inventory button is unavailable.
