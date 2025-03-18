# contract-generation
Small application to generate contracts digitally

The application is based on ElectronJS and contracts are generated using carbone

Setup configuration:
* copy .env.sample to .env
* Fill in values for environment variables

To start application run:  
* npm install
* npm start
* npm run make (to build executable)

Generating pdfs requires LibreOffice to be installed

To run tests:
* npx electron-mocha test/main.test.js