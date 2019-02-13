const config = require("../config/config");
const eLogger = require("../lib/logger").eLogger;
const paypalLogger = require("../lib/logger").paypalLogger;

const PaypalPayment = require("../models/paypalPayment").PaypalPayment;

const zoho = require("../lib/zohoCRM");
const paypal = require("paypal-rest-sdk");

paypal.configure({
	"mode"         : "sandbox", //sandbox or live
	"client_id"    : config.get("paypal:client_id"),
	"client_secret": config.get("paypal:client_secret")
});

class PayPal {
	async createPayment(data) {
		try {
			let amount = (Math.round(parseFloat(data.productPrice) * 100) / 100).toString();

			const elements = data.productPrice.toString().split(".");
			if (!elements[1]) {
				amount += ".00";
			} else if (elements[1].length === 1) {
				amount += "0";
			}

			const createPaymentJSON = {
				"intent"       : "sale",
				"payer"        : {
					"payment_method": "paypal"
				},
				"redirect_urls": {
					"return_url": config.get("url") + "paypal/process",
					"cancel_url": data.cancelURL || "https://geniusmarketing.me"
				},
				"transactions" : [{
					"item_list"  : {
						"items": [{
							"name"    : data.productName,
							"price"   : amount,
							"currency": data.currency,
							"quantity": 1
						}]
					},
					"amount"     : {
						"currency": data.currency,
						"total"   : amount
					},
					"description": data.paymentDescription || ""
				}]
			};

			return new Promise(resolve => {
				paypal.payment.create(createPaymentJSON, function (error, payment) {
					if (error) {
						eLogger.error(error);
						resolve({
							result: 0,
							error : "Error on PayPal side"
						});
					} else {
						// console.log("Create Payment Response");
						console.log(payment);

						let link = null;
						if (payment && payment.links && (payment.links.length > 0)) {
							for (let i = 0; i < payment.links.length; i++) {
								if (payment.links[i].rel === "approval_url") {
									link = payment.links[i].href;
								}
							}
						}

						if (link) {
							if (payment.id) {
								const paypalPayment = new PaypalPayment({
									paymentID   : payment.id,
									salesOrderID: data.salesOrderID
								});

								paypalPayment.save((err) => {
									if (err) {
										eLogger.error(err);
									}

									resolve({
										result: 1,
										link
									});
								});
							} else {
								resolve({
									result: 1,
									link
								});
							}
						} else {
							resolve({
								result: 0,
								error : "Payment URL not found"
							});
						}
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
													resolve(200);
												});
											} else {
												resolve(200);
											}
										});
								} else {
									return 400;
								}
							} else {
								return 400;
							}
						}
					});
				});
			} else {
				return 400;
			}
		} catch (err) {
			eLogger.error(err);
			return 500;
		}
	}
}

module.exports = new PayPal();
