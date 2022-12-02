const config = require("../config/config");
const baseUrl = config.get("url") || "";

const { iLogger } = require("../lib/logger");
const { eLogger } = require("../lib/logger");

async function generateLink (ctx, bank) {
	try {
		iLogger.info(`ZOHO request for link creation ${JSON.stringify(ctx.request, null, 2)}, body: ${JSON.stringify(ctx.request.body, null, 2)}`);
		if (ctx.request && ctx.request.query) {
			const { email, firstName, phone, salesOrderID, productName, productID, productPrice, currency, merchantID } = ctx.request.query;
			if (email && firstName && phone && salesOrderID && productName && productID && productPrice && currency && merchantID) {
				let link = "";

				switch (bank) {
				case "mono":
					link = encodeURI(`${baseUrl}checkout/2?email=${email}&firstName=${firstName}&phone=${phone}&salesOrderID=${salesOrderID}&productID=${productID}&productName=${productName}&productPrice=${productPrice}&currency=${currency}&merchantID=${merchantID}&lang=ru&payPalHide=true&fondyHide=true&privatHide=true&frisbeeHide=true`);
					break;
				case "frisbee":
					link = encodeURI(`${baseUrl}checkout/2?email=${email}&firstName=${firstName}&phone=${phone}&salesOrderID=${salesOrderID}&productID=${productID}&productName=${productName}&productPrice=${productPrice}&currency=${currency}&merchantID=${merchantID}&lang=ru&payPalHide=true&fondyHide=true&privatHide=true&monoHide=true`);
					break;
				case "privat":
					link = encodeURI(`${baseUrl}checkout/2?email=${email}&firstName=${firstName}&phone=${phone}&salesOrderID=${salesOrderID}&productID=${productID}&productName=${productName}&productPrice=${productPrice}&currency=${currency}&merchantID=${merchantID}&lang=ru&payPalHide=true&fondyHide=true&monoHide=true&frisbeeHide=true`);
					break;
				}

				return {
					status: 200,
					link
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
