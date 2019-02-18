const config = require("../config/config");
const eLogger = require("../lib/logger").eLogger;
const yandexLogger = require("../lib/logger").yandexLogger;
const request = require("request");
const uuidv4 = require("uuid/v4");

const zoho = require("../lib/zohoCRM");

const shopID = config.get("yandexKassa:shopID");
const secretKey = config.get("yandexKassa:secretKey");

class YandexKassa {
	async createPayment(data) {
		try {
			const dataForReq = {
				"amount"             : {
					"value"   : data.productPrice.toString(),
					"currency": data.currency
				},
				"confirmation"       : {
					"type"      : "redirect",
					"return_url": "https://geniusmarketing.me" //data.redirectURL
				},
				"payment_method_data": {
					"type": "bank_card"
				},
				"metadata"           : {
					"salesOrderID": "0123456789"
				},
				"receipt"            : {
					"email": data.Email,
					"items": [{
						"description": data.paymentDescription || "Заказ",
						"quantity"   : "1.00",
						"amount"     : {
							"value"   : data.productPrice.toString(),
							"currency": data.currency
						},
						"vat_code"   : "2"
					}]
				},
				"capture"            : true,
				"description"        : data.paymentDescription || "Заказ"
			};

			console.log("dataForReq", dataForReq);

			const options = {
				headers: {
					"Idempotence-Key": uuidv4(),
					"Content-Type"   : "application/json"
				},
				auth   : {
					user: shopID,
					pass: secretKey
				},
				method : "POST",
				body   : dataForReq,
				json   : true,
				url    : "https://payment.yandex.net/api/v3/payments"
			};

			return new Promise(resolve => {
				request(options, (error, response) => {
					console.info("error", error);
					console.info("response", response);

					if (error) {
						eLogger.error(error);
						resolve(null);
					} else if (response) {
						resolve(response.body);
					} else {
						resolve(null);
					}
				});
			});
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0,
				error : "Unknown error"
			};
		}
	}

	async processCallback(data) {
		try {
			yandexLogger.info(data);

			if (data && (data.event === "payment.succeeded") && data.object && (data.object.status === "succeeded") && data.object.paid) {
				let amount = 0;
				if (data.object.amount) {
					amount = parseFloat(data.object.amount.value);
				}

				if (data.object.metadata && data.object.metadata.salesOrderID) {
					const data = {
						invoice      : data.object.metadata.salesOrderID,
						sposob_oplaty: "Яндекс.Касса",
						total_sum    : amount
					};

					zoho.createPayment(data).then(() => {
						return 200;
					});
				} else {
					return 200;
				}
			} else {
				return 200;
			}
		} catch (err) {
			eLogger.error(err);
			return 500;
		}
	}
}

module.exports = new YandexKassa();
