const config = require("../config/config");
const crypto = require("crypto");
const axios = require("axios");

const eLogger = require("../lib/logger").eLogger;
const iLogger = require("../lib/logger").iLogger;

const zoho = require("../lib/zohoCRM");

const PrivatOrder = require("../models/privatOrder").PrivatOrder;

const RESPONSE_URL = config.get("privatbank:response_url");
const STORE_ID = config.get("privatbank:store_id");
const REDIRECT_URL = config.get("privatbank:redirect_url");
const API_URL = config.get("privatbank:api_url");
const PASSWORD = config.get("privatbank:privat_password");

const { generateOrder } = require("../lib/orderGenerate");

class PrivatBank {

	async createPayment (data) {
		try {
			const ORDER_ID = "Genius_Marketing_Order_" + generateOrder();

			const requestToPrivat = {
				"storeId": STORE_ID,
				"orderId": ORDER_ID,
				"amount": data.price,
				"partsCount": data.parts,
				"merchantType": "PP",
				"products": [
					{
						"name": data.productName,
						"count": 1,
						"price": data.price
					}
				],
				"responseUrl": RESPONSE_URL,
				"redirectUrl": REDIRECT_URL,
				"signature": ""
			};

			const signatureString =
				PASSWORD +
				STORE_ID +
				requestToPrivat.orderId +
				requestToPrivat.amount * 100 +
				requestToPrivat.partsCount +
				requestToPrivat.merchantType +
				RESPONSE_URL +
				REDIRECT_URL +
				requestToPrivat.products[0].name +
				requestToPrivat.products[0].count +
				requestToPrivat.products[0].price * 100 +
				PASSWORD;

			requestToPrivat.signature = crypto.createHash("sha1").update(signatureString).digest("base64");

			const result = await axios.post(`${API_URL}payment/create`, requestToPrivat);
			if (result.data && result.data.state === "SUCCESS") {
				if (result.data.token) {
					requestToPrivat.state = "SUCCESS";
					requestToPrivat.name = data.name;
					requestToPrivat.email = data.email;
					requestToPrivat.phone = data.phone;
					requestToPrivat.currency = data.currency;
					requestToPrivat.product_id = data.productID;
					requestToPrivat.product_name = data.productName;
					requestToPrivat.salesOrderID = data.salesOrderID;
					requestToPrivat.internal_order_id = requestToPrivat.orderId;

					const thirtyMinutesLater = new Date();
					thirtyMinutesLater.setMinutes(thirtyMinutesLater.getMinutes() + 30);
					requestToPrivat.requestCallbackDate = thirtyMinutesLater;

					delete requestToPrivat.orderId;
					delete requestToPrivat.storeId;
					delete requestToPrivat.signature;

					await PrivatOrder.create(requestToPrivat);

					return {
						result: 1,
						token: result.data.token
					};
				} else {
					return {
						result: 0
					};
				}
			} else {
				return {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(`Privat createPayment error: ${err}`);
			return {
				result: 0
			};
		}
	}

	async requestCallbacks () {
		try {
			iLogger.info("Privat requestCallbacks job started");
			const orders = await PrivatOrder.find({ status: "not_processed", requestCallbackDate: { $lte: new Date() } });
			if (orders && orders.length > 0) {
				let counter = 0;

				for (const order of orders) {
					await this.wait(1000);
					await axios.post(`${API_URL}payment/callback`, { orderId: order.internal_order_id });

					order.status = "processed";
					await order.save();

					counter++;

					if (counter === orders.length) {
						iLogger.info("Privat requestCallbacks job ended: orders processed " + orders.length);
					}
				}
			} else {
				iLogger.info("Privat requestCallbacks job ended: no orders to process");
			}
		} catch (err) {
			eLogger.error(`Privat requestCallbacks error: ${err}`);
		}
	}

	async processCallback (body) {
		try {
			if (body) {
				iLogger.info(`Privatbank callback body: ${JSON.stringify(body)}`);
				const order = await PrivatOrder.findOne({ internal_order_id: body.orderId });
				if (order) {
					order.status = "processed";
					order.paymentState = body.paymentState;

					await order.save();

					await this.sendDataToCrm(order);
				}
			}

			return {
				result: 1
			};
		} catch (err) {
			eLogger.error(`Privat sendDataToCrm error: ${err}`);
			return {
				result: 0
			};
		}
	}

	async sendDataToCrm (order) {
		try {
			if (order) {
				const data = {
					invoice: order.salesOrderID,
					total_sum: order.amount,
					currency: order.currency,
					status: order.paymentState,
					autooplata: false,
					sposob_oplaty: "Privatbank"
				};

				await zoho.createPaymentV2(data);
			}

			return {
				result: 1
			};
		} catch (err) {
			eLogger.error(`Privat sendDataToCrm error: ${err}`);
			return {
				result: 0
			};
		}
	}

	async wait (ms) {
		return new Promise(resolve => {
			setTimeout(resolve, ms);
		});
	}

}

module.exports = new PrivatBank();
