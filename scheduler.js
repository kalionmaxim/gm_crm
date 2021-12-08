const schedule = require("node-schedule");

const PrivatBank = require("./lib/privatBank");

const eLogger = require("./lib/logger").eLogger;

schedule.scheduleJob("*/30 * * * *", async function () {
	try {
		await PrivatBank.requestCallbacks();
	} catch (err) {
		eLogger.error("Scheduler – processing Privat orders error: " + err);
	}
});
