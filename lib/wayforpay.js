const config = require("../config/config");
const crypto = require("crypto");
const eLogger = require("../lib/logger").eLogger;

const STORE_SECRET = config.get("wayforpay:merchantSecretKey");

const WayforpayOrder = require("../models/wayforpayOrder").WayforpayOrder;

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

	async createOrder(data) {
		const order = await WayforpayOrder.create(data);

		if (order) {
			return {
				result: 1,
				order
			};
		} else {
			return {
				result: 0
			};
		}
	}
}

module.exports = new WayForPay();
