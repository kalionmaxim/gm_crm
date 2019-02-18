const config = require("../config/config");
const eLogger = require("../lib/logger").eLogger;
const yandexLogger = require("../lib/logger").yandexLogger;
const request = require("request");
const uuidv4 = require("uuid/v4");

const zoho = require("../lib/zohoCRM");

const shopID = config.get("yandexKassa:shopID");
const secretKey = config.get("yandexKassa:secretKey");

// const auth = Buffer.alloc((shopID + ":" + secretKey).toString("base64"));

class YandexKassa {
	async createPayment(data) {
		try {
			const dataForReq = {
				"amount"             : {
					"value"   : data.productPrice.toString(),
					// "currency": "RUB"
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
					// "phone": data.Phone,
					"email": data.Email,
					"items": [{
						"description": data.paymentDescription || "Заказ",
						"quantity"   : "1.00",
						"amount"     : {
							"value"   : data.productPrice.toString(),
							"currency": data.currency
						},
						"vat_code"   : "2"
						/*"payment_mode"   : "full_prepayment",
						"payment_subject": "commodity"*/
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
			console.log(data);

			return 200;
		} catch (err) {
			eLogger.error(err);
			return 500;
		}
	}

	/*

	async processCallback(body, paymentIdIn, payerIdIn) {
		try {
			if (payerIdIn && payerIdIn) {
				const paymentId = paymentIdIn;
				const payerId = { payer_id: payerIdIn };

				return new Promise(resolve => {
					paypal.payment.execute(paymentId, payerId, function (error, payment) {
						if (error) {
							console.error(error);
							paypalLogger.info(error);
						} else {
							if (payment) {
								paypalLogger.info(payment);

								if (payment.state === "approved") {
									PaypalPayment.findOne({ paymentID: paymentId })
										.exec((err, paypalPayment) => {
											if (err) {
												eLogger.error(err);
											}

											if (paypalPayment && paypalPayment.salesOrderID) {
												let amount = 0;
												if (payment.transactions && payment.transactions[0] && payment.transactions[0].amount) {
													amount = parseFloat(payment.transactions[0].amount.total);
												}

												const data = {
													invoice      : paypalPayment.salesOrderID,
													sposob_oplaty: "PayPal",
													total_sum    : amount
												};

												zoho.createPayment(data).then(() => {
													resolve({
														result: 1,
														link  : paypalPayment.successURL || null
													});
												});
											} else {
												resolve({
													result: 1,
													link  : paypalPayment.successURL || null
												});
											}
										});
								} else {
									PaypalPayment.findOne({ paymentID: paymentId })
										.exec((err, paypalPayment) => {
											if (err) {
												eLogger.error(err);
											}

											if (paypalPayment && paypalPayment.failureURL) {
												resolve({
													result: 1,
													link  : paypalPayment.failureURL
												});
											} else {
												resolve({
													result: 1
												});
											}
										});
								}
							} else {
								resolve({
									result: 0
								});
							}
						}
					});
				});
			} else {
				return {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0
			};
		}
	}*/
}

module.exports = new YandexKassa();
