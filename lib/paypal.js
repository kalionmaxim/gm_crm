const config = require("../config/config");
const eLogger = require("../lib/logger").eLogger;
const paypalLogger = require("../lib/logger").paypalLogger;

const PaypalPayment = require("../models/paypalPayment").PaypalPayment;

const zoho = require("../lib/zohoCRM");
const paypal = require("paypal-rest-sdk");

paypal.configure({
	"mode"         : config.get("paypal:mode"), //sandbox or live
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

			let responseLink2 = (config.get("url") + "checkout/3?productName=" + encodeURIComponent(data.productName)).toString();
			if (data.lang) {
				responseLink2 += ("&lang=" + encodeURIComponent(data.lang));
			}

			if (data.successLink) {
				responseLink2 += ("&successLink=" + encodeURIComponent(data.successLink));
			}

			const createPaymentJSON = {
				"intent"       : "sale",
				"payer"        : {
					"payment_method": "paypal"
				},
				"redirect_urls": {
					"return_url": config.get("url") + "paypal/process",
					"cancel_url": data.redirectURL || responseLink2
				},
				"transactions" : [{
					"item_list"  : {
						"items": [{
							"name"    : data.productName,
							"price"   : amount,
							"currency": data.currency.toUpperCase(),
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
						// console.log(payment);

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
									salesOrderID: data.salesOrderID,
									successURL  : data.redirectURL || responseLink2,
									failureURL  : data.redirectURL || responseLink2
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
												let currency = "UAH";
												if (payment.transactions && payment.transactions[0] && payment.transactions[0].amount) {
													amount = parseFloat(payment.transactions[0].amount.total);
													currency = payment.transactions[0].amount.currency;
												}

												const data = {
													invoice      : paypalPayment.salesOrderID,
													sposob_oplaty: "PayPal",
													total_sum    : amount,
													Currency     : currency
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
	}
}

module.exports = new PayPal();
