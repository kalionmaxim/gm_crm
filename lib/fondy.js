const config = require("../config/config");
const eLogger = require("../lib/logger").eLogger;
const fondyLogger = require("../lib/logger").fondyLogger;
const request = require("request");

const FondyMerchant = require("../models/fondyMerchant").FondyMerchant;

const sha1 = require("sha1");

const zoho = require("../lib/zohoCRM");

class Fondy {
	async createPayment(data) {
		try {
			if (data.merchantID && (data.merchantID.length > 0)) {
				const merchant = await FondyMerchant.findOne({ ID: data.merchantID });

				if (merchant) {
					if (data.salesOrderID) {
						//Устанавливаем в мерчант дата ИД счёта из СРМ
						const merchantData = data.salesOrderID;

						const requestToFondy = {
							server_callback_url: config.get("url") + "fondy/callback",
							response_url       : data.responseURL,
							order_id           : "GeniusMarketingOrder-" + (parseInt(merchant.lastOrderID, 10) + 1),
							order_desc         : data.paymentDescription,
							currency           : data.currency,
							amount             : data.productPrice * 100,
							merchant_id        : merchant.ID,
							required_rectoken  : "N",
							payment_systems    : "card",
							merchant_data      : merchantData,
							sender_email       : data.Email
						};

						merchant.lastOrderID++;
						await merchant.save();

						const signatureString = merchant.password + "|" +
							requestToFondy.amount + "|" +
							requestToFondy.currency + "|" +
							requestToFondy.merchant_data + "|" +
							requestToFondy.merchant_id + "|" +
							requestToFondy.order_desc + "|" +
							requestToFondy.order_id + "|" +
							requestToFondy.payment_systems + "|" +
							requestToFondy.required_rectoken + "|" +
							requestToFondy.response_url + "|" +
							requestToFondy.sender_email + "|" +
							requestToFondy.server_callback_url;

						requestToFondy.signature = sha1(signatureString);

						const rSend = { "request": requestToFondy };

						const url = "https://api2.fondy.eu/api/checkout/url/";
						const options = {
							method: "post",
							body  : rSend,
							json  : true,
							url   : url
						};

						return new Promise(resolve => {
							request(options, function (error, response, body) {
								if (error) {
									eLogger.error(error);
									resolve({
										result: 0
									});
								} else {
									fondyLogger.info(data.Email, JSON.stringify(body));
									if (response) {
										if (response.body.response.response_status === "success") {
											resolve({
												result: 1,
												link  : response.body.response.checkout_url
											});
										} else {
											resolve({
												result: 0
											});
										}
									}
								}
							});
						});
					} else {
						return {
							result: 0,
							error : "salesOrderID not found"
						};
					}
				} else {
					return {
						result: 0,
						error : "merchant not found"
					};
				}
			} else {
				return {
					result: 0,
					error : "merchantID is undefined"
				};
			}
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0,
				error : "Unknown error"
			};
		}
	}

	async processCallback(order) {
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
	}
}

module.exports = new Fondy();
