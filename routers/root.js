const Router = require("koa-router");
const router = new Router();

const zoho = require("../lib/zohoCRM");
const Fondy = require("../lib/fondy");
const PayPal = require("../lib/paypal");
const Yandex = require("../lib/yandexKassa");

router.get("/", async (ctx) => {
	await ctx.render("pages/client/index");
});

router.post("/", async (ctx) => {
	await ctx.render("pages/client/index");
});

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

router.get("/yandex/form", async (ctx) => {
	await ctx.render("pages/client/yandex");
});

router.post("/yandex/payment", async (ctx) => {
	ctx.body = await Yandex.createPayment(ctx.request.body);
});

router.post("/yandex/callback", async (ctx) => {
	ctx.status = await Yandex.processCallback(ctx.request.body);
	/*const data = await Yandex.processCallback(ctx.request.body, ctx.query.paymentId, ctx.query.PayerID);

	if (data.result) {
		if (data.link) {
			await ctx.redirect(data.link);
		} else {
			ctx.status = 400;
		}
	} else {
		ctx.status = 400;
	}*/
});

module.exports = router;
