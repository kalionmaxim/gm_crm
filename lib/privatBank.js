const config = require("../config/config");
const crypto = require("crypto");
const request = require("request");
const axios = require("axios");
const eLogger = require("../lib/logger").eLogger;

const RESPONSE_URL = config.get("privatnank:responce_url");
const STORE_ID = config.get("privatnank:store_id");
const REDIRECT_URL = config.get("privatnank:redirect_url");
const API_URL = config.get("privatnank:api_url");
const PASSWORD = config.get("privatnank:privat_password");
const sha1 = require("sha1");
const base64 = require("base-64");
// eslint-disable-next-line standard/object-curly-even-spacing
const { generateOrder } = require("../lib/orderGenerate");

class PrivatBank {
	
  async createPayment(data) {
        try {
          const requestToPrivat = {
            "storeId": STORE_ID,
            "orderId": "GeniusMarketingOrder-" + generateOrder(),
            "amount": data.price,
            "partsCount": data.parts,
            "merchantType": "PP",
            "products": [
              {
                "name": data.productName,
                "count": "1",
                "price": data.price
              }
            ],
            "responseUrl": RESPONSE_URL,
            "redirectUrl": REDIRECT_URL,
            "signature": ""
          };
          requestToPrivat.signature = base64.encode((sha1(PASSWORD + STORE_ID +
            requestToPrivat.orderId + requestToPrivat.amount  + requestToPrivat.partsCount +
            requestToPrivat.merchantType + RESPONSE_URL + REDIRECT_URL + requestToPrivat.products[0].name + requestToPrivat.products[0].count +
            requestToPrivat.products[0].price + PASSWORD
          )));
          console.dir(requestToPrivat);
          const result = await axios.post(`${API_URL}payment/create`, requestToPrivat);
          console.log(result)
          return 1;
          } catch (error) {
            eLogger.error(error);
          return 0;
        }
    }
}

module.exports = new PrivatBank();
