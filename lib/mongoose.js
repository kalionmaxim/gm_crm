/**
 * Created by Grigoriy on 15.06.2016.
 */
const mongoose = require("mongoose");
const config = require("../config/config");
// LOGGER =====================================
const log4js = require("log4js");
log4js.configure(config.get("logger"));
const eLogger = log4js.getLogger("errors-logger");
eLogger.setLevel("ERROR");

mongoose.Promise = Promise;
mongoose.connect(config.get("mongoose:uri"), {
	useMongoClient: true
});

const db = mongoose.connection;

const autoIncrement = require("mongoose-auto-increment-fix");
autoIncrement.initialize(mongoose.connection);

// When successfully connected
db.on("connected", function () {
	console.log("Mongoose default connection open");
});

// If the connection throws an error
db.on("error", function (err) {
	eLogger.error(err);
	console.log("Mongoose default connection error: " + err);
});

// When the connection is disconnected
db.on("disconnected", function () {
	mongoose.disconnect();
	console.log("Mongoose default connection disconnected");
});

module.exports = mongoose;
module.exports.autoIncrement = autoIncrement;
