const config = require("../config/config");
const crypto = require("crypto");
const axios = require("axios");
const eLogger = require("../lib/logger").eLogger;

const RESPONSE_URL = config.get("privatbank:responce_url");
const STORE_ID = config.get("privatbank:store_id");
const REDIRECT_URL = config.get("privatbank:redirect_url");
const API_URL = config.get("privatbank:api_url");
const PASSWORD = config.get("privatbank:privat_password");
const { generateOrder } = require("../lib/orderGenerate");

class PrivatBank {

	async createPayment (data) {
		try {
			const requestToPrivat = {
				"storeId": STORE_ID,
				"orderId": "GeniusMarketingOrder-" + generateOrder(),
				"amount":data.price,
				"partsCount": data.parts,
				"merchantType": "PP",
				"products": [
					{
						"name":  data.productName,
						"count": "1",
						"price":  data.price
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
			console.log(result.data.token);
			if (result.data && result.data.state === "SUCCESS") {
				if (result.data.token) {
					return {
						result: 1,
						token: result.data.token
					};
				} else {
					return {
						result: 0
					};
				}
			}
		
		} catch (error) {
			eLogger.error(error);
			return {
				result: 0
			};
		}
	}
}

module.exports = new PrivatBank();
