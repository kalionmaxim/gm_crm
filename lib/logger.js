const log4js = require("log4js");
const config = require("./../config/config");
log4js.configure(config.get("logger"));

const wLogger = log4js.getLogger("warnings-logger");
const eLogger = log4js.getLogger("errors-logger");
const iLogger = log4js.getLogger("info-logger");
const crmLogger = log4js.getLogger("crm-logger");
const fondyLogger = log4js.getLogger("fondy-logger");

wLogger.setLevel("WARN");
eLogger.setLevel("ERROR");
iLogger.setLevel("INFO");
crmLogger.setLevel("INFO");
fondyLogger.setLevel("INFO");

exports.wLogger = wLogger;
exports.eLogger = eLogger;
exports.iLogger = iLogger;
exports.crmLogger = crmLogger;
exports.fondyLogger = fondyLogger;
