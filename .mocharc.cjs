//require('ts-node/register');
module.exports = {
    //require: 'ts-node/register', // needed for typescript support
    timeout: 5000,
    reporter: 'spec',
    ui: 'bdd',
    extension: ['js'],
    spec: 'test/**/*.test.js'
};