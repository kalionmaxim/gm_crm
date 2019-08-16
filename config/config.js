/**
 * Created by Alexandr_G on 06.12.2016.
 */
const nconf = require('nconf');
const path = require('path');

nconf.argv()
    .env()
    .file({file: path.join(__dirname, 'config.json')});

module.exports = nconf;