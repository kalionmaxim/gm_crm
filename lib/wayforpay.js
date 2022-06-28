const config = require("../config/config");
const crypto = require("crypto");
const eLogger = require("../lib/logger").eLogger;

const STORE_SECRET = config.get("wayforpay:merchantSecretKey");

class WayForPay {
	async sign(data) {
		try {
			const sign = crypto
				.createHmac("md5", STORE_SECRET)
				.update(data)
				.digest("hex");

			return {
				result: 1,
				sign
			};
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0
			};
		}
	}
}

module.exports = new WayForPay();
