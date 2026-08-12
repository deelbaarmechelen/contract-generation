const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

/** Packages the app actually needs at runtime, from `npm ls --omit=dev --all`.
 * Everything else under node_modules is left out of the package. */
const RUNTIME_MODULES = new Set([
  'ajv',
  'ajv-formats',
  'atomically',
  'conf',
  'debounce-fn',
  'debug',
  'dot-prop',
  'dotenv',
  'electron-log',
  'electron-squirrel-startup',
  'electron-store',
  'env-paths',
  'fast-deep-equal',
  'fast-uri',
  'google-libphonenumber',
  'ibantools',
  'json-schema-traverse',
  'json-schema-typed',
  'mimic-function',
  'ms',
  'require-from-string',
  'semver',
  'stubborn-fs',
  'stubborn-utils',
  'tagged-tag',
  'type-fest',
  'uint8array-extras',
  'when-exit',
]);

/** Project files that are only useful during development.
 * Supplying an `ignore` function replaces Packager's built-in defaults, so the
 * entries it would normally exclude (.git, out/, the packaged output) are
 * repeated here explicitly. */
const DEV_ONLY_PATHS = [
  /^\/\.git($|\/)/,
  /^\/test($|\/)/,
  /^\/out($|\/)/,
  /^\/\.vscode($|\/)/,
  /^\/\.github($|\/)/,
  /^\/\.gitignore$/,
  /^\/eslint\.config\.mjs$/,
  /^\/\.mocharc\.cjs$/,
  /^\/forge\.config\.js$/,
  /^\/todo\.md$/,
  /^\/technical-explanation\.md$/,
  /^\/README\.md$/,
  /^\/digital-contract\.code-workspace$/,
  /^\/\.env(\..*)?$/,
  // The .odt templates are historical reference, not used at runtime.
  /^\/resources\/.*\.odt$/,
];

module.exports = {
  packagerConfig: {
    // Bundle the app into a single app.asar instead of shipping loose files.
    asar: true,
    name: 'Contract Generator',
    executableName: 'contract-generator',
    appCopyright: `Copyright (C) ${new Date().getFullYear()} Den Ideal vzw`,
    // icon: './resources/icon',  // supply icon.ico (Windows) / icon.icns (macOS) to brand the app
    // Keep development-only files out of the shipped package.
    //
    // `prune` alone is unreliable here: it reads npm's tree metadata, and the
    // `overrides` in package.json leave devDependencies resolvable, so the whole
    // build toolchain gets copied in. Instead every node_modules entry is dropped
    // unless it is on RUNTIME_MODULES below, which is derived from
    // `npm ls --omit=dev --all`. Add to that list when a runtime dependency is added.
    prune: true,
    // Note: Electron Packager only honours a *function* when `ignore` is the
    // function itself. Passing an array makes it treat every entry as a regex
    // and silently skip functions, so both rules live in one predicate here.
    ignore: (filePath) => {
      if (filePath === '') {
        return false;
      }

      if (filePath.startsWith('/node_modules')) {
        const segments = filePath.split('/').filter(Boolean);
        // '/node_modules' itself must be kept, or nothing below it is walked.
        if (segments.length < 2) {
          return false;
        }
        const scoped = segments[1].startsWith('@');
        // Keep the scope directory itself so its allowed children survive.
        if (scoped && segments.length === 2) {
          return false;
        }
        const packageName = scoped ? `${segments[1]}/${segments[2]}` : segments[1];
        return !RUNTIME_MODULES.has(packageName);
      }

      return DEV_ONLY_PATHS.some((pattern) => pattern.test(filePath));
    },
  },
  rebuildConfig: {},
  makers: [
    { // https://www.electronforge.io/config/makers/squirrel.windows
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'contract_generator',
        setupExe: 'ContractGenerator-Setup.exe',
        // setupIcon: './resources/icon.ico',
        // certificateFile: './cert.pfx',
        // certificatePassword: process.env.CERTIFICATE_PASSWORD
      },
    },
    { // Portable build: unzip and run, no installer and no admin rights needed.
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'darwin', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    // {
    //   name: '@electron-forge/plugin-auto-unpack-natives',
    //   config: {},
    // },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
      [FuseV1Options.OnlyLoadAppFromAsar]: false,
    }),
  ],
};
