require('ts-node/register');
module.exports = {
    require: 'ts-node/register',
    timeout: 5000,
    reporter: 'spec',
    ui: 'bdd',
    extension: ['js', 'ts'],
    spec: 'test/**/*.test.js'
};