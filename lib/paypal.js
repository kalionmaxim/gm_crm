const config = require("../config/config");
const eLogger = require("../lib/logger").eLogger;
const fondyLogger = require("../lib/logger").fondyLogger;
const request = require("request");

const PaypalPayment = require("../models/paypalPayment").PaypalPayment;

const sha1 = require("sha1");

const zoho = require("../lib/zohoCRM");
const paypal = require("paypal-rest-sdk");

paypal.configure({
	"mode"         : "sandbox", //sandbox or live
	"client_id"    : "AZZy05bqg9wI0FoVt3OkezptaAhT3obxrUR1Sfud7jLhjBRtTedM00Ef7pqMS-vkhHCFUiWvCh0nvJoL",
	"client_secret": "EPLvB_VqkoOxoN-yPg06cHvt_IkQ3F7-qB0S-O5kFN7cmevjUho28JKu1MqBwf-GVshMn8R79oPqjGo4"
	// "client_id"    : "ASQJozeM5UL78hk81H51jiiNj6fsUpLyZyQJM4PyIvVp64g39ZQ5aqsyopar9HAXCLDxQjWS70Sw3wWm",
	// "client_secret": "EMNrTZ32H1_9mtroUJVcZ_n8YejGVkWefrPFB7hNiO3MQcHq4JKW4pLlk3e6aPyAk74A8VVBW3EtSdD0"
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

	/*async processCallback(order) {
		try {
			fondyLogger.info(order);

			if (order && (order.order_status === "approved") && (parseInt(order.reversal_amount, 10) === 0) && order.merchant_data && (order.merchant_data.length > 0)) {
				const data = {
					invoice      : order.merchant_data,
					sposob_oplaty: "Fondy",
					total_sum    : (order.amount / 100).toFixed(2)
				};

				await zoho.createPayment(data);

				return 200;
			} else {
				return 200;
			}
		} catch (err) {
			eLogger.error(err);
			return 500;
		}
	}*/
}

module
	.exports = new PayPal();
