const log4js = require("log4js");
const config = require("./../config/config");
log4js.configure(config.get("logger"));

const wLogger = log4js.getLogger("warnings-logger");
const eLogger = log4js.getLogger("errors-logger");
const iLogger = log4js.getLogger("info-logger");
const crmLogger = log4js.getLogger("crm-logger");
const fondyLogger = log4js.getLogger("fondy-logger");
const paypalLogger = log4js.getLogger("paypal-logger");
const yandexLogger = log4js.getLogger("yandex-logger");
const monoLogger = log4js.getLogger("mono-logger");

wLogger.setLevel("WARN");
eLogger.setLevel("ERROR");
iLogger.setLevel("INFO");
crmLogger.setLevel("INFO");
fondyLogger.setLevel("INFO");
paypalLogger.setLevel("INFO");
yandexLogger.setLevel("INFO");
monoLogger.setLevel("INFO");

exports.wLogger = wLogger;
exports.eLogger = eLogger;
exports.iLogger = iLogger;
exports.crmLogger = crmLogger;
exports.fondyLogger = fondyLogger;
exports.paypalLogger = paypalLogger;
exports.yandexLogger = yandexLogger;
exports.monoLogger = monoLogger;
