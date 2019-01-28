const log4js = require('log4js');
const config = require('./../config/config');
log4js.configure(config.get('logger'));

const wLogger = log4js.getLogger('warnings-logger');
const eLogger = log4js.getLogger('errors-logger');
const iLogger = log4js.getLogger('info-logger');

wLogger.setLevel('WARN');
eLogger.setLevel('ERROR');
iLogger.setLevel('INFO');

exports.wLogger = wLogger;
exports.eLogger = eLogger;
exports.iLogger = iLogger;
