const config = require("../config/config");
const crypto = require("crypto");
const request = require("request");
const axios = require("axios");
const eLogger = require("../lib/logger").eLogger;

const RESPONSE_URL = config.get("privatbank:responce_url");
const STORE_ID = config.get("privatbank:store_id");
const REDIRECT_URL = config.get("privatbank:redirect_url");
const API_URL = config.get("privatbank:api_url");
const PASSWORD = config.get("privatbank:privat_password");
const sha1 = require("sha1");
const base64 = require("base-64");
// eslint-disable-next-line standard/object-curly-even-spacing
const { generateOrder } = require("../lib/orderGenerate");
class PrivatBank {
	getProductsStirng(prop) {
    const result = '';
    for (key of prop) {
       // eslint-disable-next-line no-const-assign
       result += key.name + key.price;
    }
    return result;
  }
  
  
  async createPayment(data) {
        try {
          const requestToPrivat = {
            "storeId": STORE_ID,
            "orderId": "GeniusMarketingOrder-" + generateOrder(),
            "amount": "300",
            "partsCount": "5",
            "merchantType": "PP",
            "products": [
              {
                "name": "телевізор",
                "count": "1",
                "price": "200"
              },
              {
                "name": "мікрохвильовка",
                "count": "1",
                "price": "100"
              }
            ],
            "responseUrl": RESPONSE_URL,
            "redirectUrl": REDIRECT_URL,
            "signature": base64.encode((sha1(PASSWORD + STORE_ID +
              this.orderId + this.amount + this.partsCount + this.merchantType +
              getProductsStirng(thid.products)  + RESPONSE_URL + REDIRECT_URL + PASSWORD
              )))
          }
          const result = await axios.post(`${API_URL}payment/create`, requestToPrivat);
            console.log(result);
          return 1;
          } catch (error) {
            eLogger.error(error);
          return 0;
        }
    }
}

module.exports = new PrivatBank();
