const config = require("../config/config");
const crypto = require("crypto");
const eLogger = require("../lib/logger").eLogger;
const zoho = require("../lib/zohoCRM");

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
			const zohoData = {
				invoice       : order.orderReference,
				sposob_oplaty : "WayForPay",
				total_sum     : order.amount,
				autooplata    : true,
				status        : order.transactionStatus === "Approved" ? "Оплачен" : "Новый",
				currency      : order.currency
			};

			await zoho.createPaymentV2(zohoData);

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
