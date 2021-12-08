const config = require("../config/config");
const axios = require("axios");
const eLogger = require("../lib/logger").eLogger;

const { generateOrder } = require("../lib/orderGenerate");

class Tinkoff {
	getOrderId () {
		return "GeniusMarketingOrder-" + generateOrder();
	
	}
	
	async callback (data) {
		try {
		console.log(data.orderNumber);
		const result = await axios.get(`https://forma.tinkoff.ru/api/partners/v2/orders/${data.orderNumber}/info`)
		console.log(result);
		} catch (err) {
		console.log(err);
		}
	}
}

module.exports = new Tinkoff();