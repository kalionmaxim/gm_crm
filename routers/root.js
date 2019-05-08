const Router = require("koa-router");
const router = new Router();

const zoho = require("../lib/zohoCRM");
const Fondy = require("../lib/fondy");
const PayPal = require("../lib/paypal");
const Monobank = require("../lib/monobank");
// const Yandex = require("../lib/yandexKassa");

const config = require("../config/config");
const merchantUSD = config.get("fondy:usd") || "";
const merchantEUR = config.get("fondy:eur") || "";
const merchantUAH = config.get("fondy:uah") || "";
const merchantRUB = config.get("fondy:rub") || "";

router.get("/checkout/1", async (ctx) => {
	if (ctx.request.query["productName"] && ctx.request.query["productID"] && ctx.request.query["productPrice"] && ctx.request.query["currency"] && ctx.request.query["merchantID"]) {
		await ctx.render("pages/client/checkout/step1", {
			productName : ctx.request.query["productName"] || "",
			productID   : ctx.request.query["productID"] || "",
			productPrice: ctx.request.query["productPrice"] || "",
			currency    : ctx.request.query["currency"] || "",
			// redirectURL : ctx.request.query["redirectURL"] || "",
			merchantID  : ctx.request.query["merchantID"] || "",
			landing     : ctx.request.query["landing"] || "false"
		});
	} else {
		ctx.body = "Some of required fields are undefined";
	}
});

router.get("/checkout/2", async (ctx) => {
	if (ctx.request.query["productName"] && ctx.request.query["email"] && ctx.request.query["firstName"] && ctx.request.query["phone"] && ctx.request.query["productPrice"] && ctx.request.query["productID"] && ctx.request.query["currency"] && ctx.request.query["merchantID"]) {
		await ctx.render("pages/client/checkout/step2", {
			productName : ctx.request.query["productName"] || "",
			productID   : ctx.request.query["productID"] || "",
			email       : ctx.request.query["email"] || "",
			phone       : ctx.request.query["phone"] || "",
			productPrice: ctx.request.query["productPrice"] || "",
			currency    : ctx.request.query["currency"] || "",
			merchantID  : ctx.request.query["merchantID"] || "",
			salesOrderID: ctx.request.query["salesOrderID"] || "",
			firstName   : ctx.request.query["firstName"] || "",
			lastName    : ctx.request.query["lastName"] || "",
			landing     : ctx.request.query["landing"] || ""
		});
	} else {
		ctx.body = "Some of required fields are undefined";
	}
});

router.get("/checkout/2/fondy", async (ctx) => {
	if (ctx.request.query["productName"] && ctx.request.query["email"] && ctx.request.query["firstName"] && ctx.request.query["phone"] && ctx.request.query["productPrice"] && ctx.request.query["productID"] && ctx.request.query["currency"] && ctx.request.query["merchantID"]) {
		await ctx.render("pages/client/checkout/step2_fondy", {
			productName : ctx.request.query["productName"] || "",
			productID   : ctx.request.query["productID"] || "",
			email       : ctx.request.query["email"] || "",
			phone       : ctx.request.query["phone"] || "",
			productPrice: ctx.request.query["productPrice"] || "",
			currency    : ctx.request.query["currency"] || "",
			// redirectURL : ctx.request.query["redirectURL"] || "",
			merchantID  : ctx.request.query["merchantID"] || "",
			salesOrderID: ctx.request.query["salesOrderID"] || "",
			firstName   : ctx.request.query["firstName"] || "",
			lastName    : ctx.request.query["lastName"] || "",
			landing     : ctx.request.query["landing"] || ""
		});
	} else {
		ctx.body = "Some of required fields are undefined";
	}
});

router.get("/checkout/2/fondy/currencies", async (ctx) => {
	if (ctx.request.query["productName"] && ctx.request.query["email"] && ctx.request.query["firstName"] && ctx.request.query["phone"] && ctx.request.query["productPrice"] && ctx.request.query["productID"] && ctx.request.query["currency"] && ctx.request.query["merchantID"]) {
		await ctx.render("pages/client/checkout/step2_fondy_currencies", {
			productName : ctx.request.query["productName"] || "",
			email       : ctx.request.query["email"] || "",
			phone       : ctx.request.query["phone"] || "",
			productPrice: ctx.request.query["productPrice"] || "",
			productID   : ctx.request.query["productID"] || "",
			currency    : ctx.request.query["currency"] || "",
			// redirectURL : ctx.request.query["redirectURL"] || "",
			merchantID  : ctx.request.query["merchantID"] || "",
			salesOrderID: ctx.request.query["salesOrderID"] || "",
			firstName   : ctx.request.query["firstName"] || "",
			lastName    : ctx.request.query["lastName"] || "",
			landing     : ctx.request.query["landing"] || "",
			merchantUSD : merchantUSD,
			merchantEUR : merchantEUR,
			merchantUAH : merchantUAH,
			merchantRUB : merchantRUB
		});
	} else {
		ctx.body = "Some of required fields are undefined";
	}
});

router.get("/checkout/2/paypal", async (ctx) => {
	if (ctx.request.query["productName"] && ctx.request.query["email"] && ctx.request.query["firstName"] && ctx.request.query["phone"] && ctx.request.query["productPrice"] && ctx.request.query["productID"] && ctx.request.query["currency"] && ctx.request.query["merchantID"]) {
		await ctx.render("pages/client/checkout/step2_paypal", {
			productName : ctx.request.query["productName"] || "",
			email       : ctx.request.query["email"] || "",
			phone       : ctx.request.query["phone"] || "",
			productPrice: ctx.request.query["productPrice"] || "",
			productID   : ctx.request.query["productID"] || "",
			currency    : ctx.request.query["currency"] || "",
			// redirectURL : ctx.request.query["redirectURL"] || "",
			merchantID  : ctx.request.query["merchantID"] || "",
			salesOrderID: ctx.request.query["salesOrderID"] || "",
			firstName   : ctx.request.query["firstName"] || "",
			lastName    : ctx.request.query["lastName"] || "",
			landing     : ctx.request.query["landing"] || ""
		});
	} else {
		ctx.body = "Some of required fields are undefined";
	}
});

router.get("/checkout/3", async (ctx) => {
	await renderSuccess(ctx);
});

router.post("/checkout/3", async (ctx) => {
	await renderSuccess(ctx);
});

async function renderSuccess(ctx) {
	await ctx.render("pages/client/checkout/step3", {
		productName: ctx.request.query["productName"] || ""
	});
}

router.post("/contact", async (ctx) => {
	/**
	 * Email, Phone – required fields
	 * First_Name,Last_Name, utm_campaign, utm_medium, utm_source, utm_term, utm_content – optionals fields
	 */

	if (ctx.request.body) {
		if (!ctx.request.body.Email) {
			ctx.body = {
				result: 0,
				error : "Required field 'Email' is undefined"
			};
		} else if (!ctx.request.body.Phone) {
			ctx.body = {
				result: 0,
				error : "Required field 'Phone' is undefined"
			};
		} else {
			ctx.body = await zoho.searchContactOrAddNew(ctx.request.body);
		}
	} else {
		ctx.body = {
			result: 0,
			error : "Bad request. Body is undefined"
		};
	}
});

router.put("/contact", async (ctx) => {
	/**
	 * contactID – required field
	 *
	 * phone, email, First_Name, Last_Name, utm_campaign, utm_medium, utm_source, utm_term, utm_content, category_of_business,
	 * kol_vo_sotrudnikov, main_task, month_income, main_result, web, obyom_invest– optionals fields
	 *
	 */

	if (ctx.request.body) {
		if (!ctx.request.body.contactID) {
			ctx.body = {
				result: 0,
				error : "Required field 'contactID' is undefined"
			};
		} else {
			ctx.body = await zoho.updateContact(ctx.request.body);
		}
	} else {
		ctx.body = {
			result: 0,
			error : "Bad request. Body is undefined"
		};
	}
});

router.post("/deal/search", async (ctx) => {
	/**
	 * Email, Phone, productID, productName, First_Name – required fields
	 * utm_campaign, utm_medium, utm_source, utm_term, utm_content – optionals fields
	 */

	if (ctx.request.body) {
		if (!ctx.request.body.Email) {
			ctx.body = {
				result: 0,
				error : "Required field 'Email' is undefined"
			};
		} else if (!ctx.request.body.Phone) {
			ctx.body = {
				result: 0,
				error : "Required field 'Phone' is undefined"
			};
		} else if (!ctx.request.body.productID) {
			ctx.body = {
				result: 0,
				error : "Required field 'productID' is undefined"
			};
		} else if (!ctx.request.body.productName) {
			ctx.body = {
				result: 0,
				error : "Required field 'productName' is undefined"
			};
		} else if (!ctx.request.body.First_Name) {
			ctx.body = {
				result: 0,
				error : "Required field 'First_Name' is undefined"
			};
		} else {
			ctx.body = await zoho.searchDeal(ctx.request.body);
		}
	} else {
		ctx.body = {
			result: 0,
			error : "Bad request. Body is undefined"
		};
	}
});

router.post("/deal", async (ctx) => {
	/**
	 * Email, Phone, productID, productName, First_Name – required fields
	 * utm_campaign, utm_medium, utm_source, utm_term, utm_content – optionals fields
	 */

	if (ctx.request.body) {
		if (!ctx.request.body.Email) {
			ctx.body = {
				result: 0,
				error : "Required field 'Email' is undefined"
			};
		} else if (!ctx.request.body.Phone) {
			ctx.body = {
				result: 0,
				error : "Required field 'Phone' is undefined"
			};
		} else if (!ctx.request.body.productID) {
			ctx.body = {
				result: 0,
				error : "Required field 'productID' is undefined"
			};
		} else if (!ctx.request.body.productName) {
			ctx.body = {
				result: 0,
				error : "Required field 'productName' is undefined"
			};
		} else if (!ctx.request.body.First_Name) {
			ctx.body = {
				result: 0,
				error : "Required field 'First_Name' is undefined"
			};
		} else {
			ctx.body = await zoho.createDeal(ctx.request.body);
		}
	} else {
		ctx.body = {
			result: 0,
			error : "Bad request. Body is undefined"
		};
	}
});

router.put("/deal", async (ctx) => {
	/**
	 * dealID – required fields
	 * lead_status, skolko_smotrel, sails_page – optionals fields
	 */

	if (ctx.request.body) {
		if (!ctx.request.body.dealID) {
			ctx.body = {
				result: 0,
				error : "Required field 'dealID' is undefined"
			};
		} else {
			ctx.body = await zoho.updateDeal(ctx.request.body);
		}
	} else {
		ctx.body = {
			result: 0,
			error : "Bad request. Body is undefined"
		};
	}
});

router.post("/sales_order", async (ctx) => {
	/**
	 * Email, Phone, productID, productName, First_Name – required fields
	 * utm_campaign, utm_medium, utm_source, utm_term, utm_content – optionals fields
	 */

	if (ctx.request.body) {
		if (!ctx.request.body.Email) {
			ctx.body = {
				result: 0,
				error : "Required field 'Email' is undefined"
			};
		} else if (!ctx.request.body.Phone) {
			ctx.body = {
				result: 0,
				error : "Required field 'Phone' is undefined"
			};
		} else if (!ctx.request.body.productID) {
			ctx.body = {
				result: 0,
				error : "Required field 'productID' is undefined"
			};
		} else if (!ctx.request.body.productName) {
			ctx.body = {
				result: 0,
				error : "Required field 'productName' is undefined"
			};
		} else if (!ctx.request.body.dealID) {
			ctx.body = {
				result: 0,
				error : "Required field 'dealID' is undefined"
			};
		} else if (!ctx.request.body.contactID) {
			ctx.body = {
				result: 0,
				error : "Required field 'contactID' is undefined"
			};
		} else if (!ctx.request.body.First_Name) {
			ctx.body = {
				result: 0,
				error : "Required field 'First_Name' is undefined"
			};
		} else {
			ctx.body = await zoho.createSalesOrder(ctx.request.body);
		}
	} else {
		ctx.body = {
			result: 0,
			error : "Bad request. Body is undefined"
		};
	}
});

router.get("/fondy/form", async (ctx) => {
	await ctx.render("pages/client/fondy");
});

router.post("/fondy/payment", async (ctx) => {
	ctx.body = await Fondy.createPayment(ctx.request.body);
});

router.post("/fondy/callback", async (ctx) => {
	ctx.status = await Fondy.processCallback(ctx.request.body);
});

router.get("/paypal/form", async (ctx) => {
	await ctx.render("pages/client/paypal");
});

router.post("/paypal/payment", async (ctx) => {
	ctx.body = await PayPal.createPayment(ctx.request.body);
});

router.get("/paypal/process", async (ctx) => {
	const data = await PayPal.processCallback(ctx.request.body, ctx.query.paymentId, ctx.query.PayerID);

	if (data.result) {
		if (data.link) {
			await ctx.redirect(data.link);
		} else {
			ctx.status = 400;
		}
	} else {
		ctx.status = 400;
	}
});

router.get("/monobank", async (ctx) => {
	await ctx.render("pages/client/monobank");
});

router.post("/monobank/validatePhone", async (ctx) => {
	ctx.body = await Monobank.validateClient(ctx.request.body.phone);
});

router.post("/monobank/order", async (ctx) => {
	const date = new Date();
	const year = date.getFullYear();
	const month = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString();
	const day = (date.getMonth() < 10) ? "0" + date.getMonth().toString() : date.getMonth().toString();
	let dateStr = year + "-" + month + "-" + day;

	const data = {
		client_phone      : ctx.request.body.phone,
		total_sum         : 3000.00,
		invoice           : {
			date  : dateStr,
			source: "INTERNET"
		},
		available_programs: [{
			available_parts_count: [10],
			type                 : "payment_installments"
		}],
		products          : [{
			name : "Test",
			count: 1,
			sum  : 3000.00
		}],
		result_callback   : config.get("url") + "monobank/callback"
	};

	ctx.body = await Monobank.createOrder(data);
});

router.post("/monobank/confirm", async (ctx) => {
	ctx.body = await Monobank.confirmDelivery(ctx.request.body.orderID);
});

router.post("/monobank/return", async (ctx) => {
	console.log("BODY:", ctx.request.body);
	ctx.body = await Monobank.returnOrder(ctx.request.body);
});

router.post("/monobank/callback", async (ctx) => {
	await Monobank.processCallback(ctx.request.body);
	ctx.status = 200;
});

router.get("/monobank/success", async (ctx) => {
	await ctx.render("pages/client/monobank-success");
});

router.get("/monobank/failure", async (ctx) => {
	await ctx.render("pages/client/monobank-failure");
});

/*router.get("/yandex/form", async (ctx) => {
	await ctx.render("pages/client/yandex");
});

router.post("/yandex/payment", async (ctx) => {
	ctx.body = await Yandex.createPayment(ctx.request.body);
});

router.post("/yandex/callback", async (ctx) => {
	ctx.status = await Yandex.processCallback(ctx.request.body);
});*/

module.exports = router;
