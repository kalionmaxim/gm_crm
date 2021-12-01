const config = require("../config/config");
const crypto = require("crypto");
const axios = require("axios");
const eLogger = require("../lib/logger").eLogger;

const RESPONSE_URL = config.get("privatbank:responce_url");
const STORE_ID = config.get("privatbank:store_id");
const REDIRECT_URL = config.get("privatbank:redirect_url");
const API_URL = config.get("privatbank:api_url");
const PASSWORD = config.get("privatbank:privat_password");
const { generateOrder, findNumbeSimbolsAfterComma } = require("../lib/orderGenerate");

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
				requestToPrivat.products[0].price * 100  +
				PASSWORD;

			requestToPrivat.signature = crypto.createHash("sha1").update(signatureString).digest("base64");
      console.log(signatureString)
			const result = await axios.post(`${API_URL}payment/create`, requestToPrivat);
			console.log(result.data);
			return result.data.token;
		} catch (error) {
			eLogger.error(error);
			return 0;
		}
	}
}

module.exports = new PrivatBank();
