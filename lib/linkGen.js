const config = require("../config/config");
const baseUrl = config.get("url") || "";

const { iLogger } = require("../lib/logger");
const { eLogger } = require("../lib/logger");

async function generateLink (ctx) {
	try {
		iLogger.info(`ZOHO request for link creation ${JSON.stringify(ctx.request, null, 2)}, body: ${JSON.stringify(ctx.request.body, null, 2)}`);
		if (ctx.request && ctx.request.query) {
			const { productName, productID, productPrice, currency, merchantID } = ctx.request.query;
			if (productName && productID && productPrice && currency && merchantID) {
				return {
					status: 200,
					link: encodeURI(`${baseUrl}checkout/1?productID=${productID}&productName=${productName}&productPrice=${productPrice}&currency=${currency}&merchantID=${merchantID}&lang=ru&payPalHide=true&fondyHide=true&privatHide=true&frisbeeHide=true&tinkoffHide=true`)
				};
			} else {
				return {
					status: 400
				};
			}
		} else {
			return {
				status: 400
			};
		}
	} catch (err) {
		eLogger.error(err);
		return {
			status: 500
		};
	}
}

module.exports = {
	generateLink
};
