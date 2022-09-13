const config = require("../config/config");
const crypto = require("crypto");
const eLogger = require("../lib/logger").eLogger;
const iLogger = require("../lib/logger").iLogger;
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

	async processOrder(data) {
		try {
			if (data) {
				iLogger.info(`WayForPay callback body: ${data}`);

				console.log(data.email);

				let order = await WayforpayOrder.findOne({ orderReference: data.orderReference });

				if (!order) order = await WayforpayOrder.create(data);

				if (order && order.transactionStatus === "Approved") {
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
						result: 1
					};
				} else {
					return {
						result: 0
					};
				}
			} else {
				iLogger.info(`WayForPay callback body (no data): ${data}`);
				return {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(`WayForPay sendDataToCrm error: ${err}`);
			return {
				result: 0
			};
		}
	}
}

module.exports = new WayForPay();
