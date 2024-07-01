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

				const parsedData = JSON.parse(data);

				if (parsedData && parsedData.transactionStatus === "Approved") {
					const order = await WayforpayOrder.findOne({ orderReference: parsedData.orderReference });
					if (order) {
						await WayforpayOrder.findOneAndUpdate({ orderReference: parsedData.orderReference }, parsedData);
					} else {
						await WayforpayOrder.create(parsedData);
					}

					const zohoData = {
						invoice: parsedData.orderReference,
						sposob_oplaty: "WayForPay",
						total_sum: parsedData.amount,
						autooplata: true,
						status: parsedData.transactionStatus === "Approved" ? "Оплачен" : "Новый",
						currency: parsedData.currency
					};

					await zoho.createPaymentV2(zohoData);

					const signature = crypto
						.createHmac("md5", STORE_SECRET)
						.update(`${parsedData.orderReference};accept;${new Date().getTime()}`)
						.digest("hex");

					return {
						orderReference: parsedData.orderReference,
						status: "accept",
						time: new Date().getTime(),
						signature: signature
					};
				} else {
					return {
						result: 0
					};
				}
				// }
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
