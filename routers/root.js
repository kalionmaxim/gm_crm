const Router = require("koa-router");
const router = new Router();

const async = require("async");
const request = require("request");

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

const eLogger = require("../lib/logger").eLogger;

const Page = require("../models/page").Page;
const MonoOrder = require("../models/monoOrder").MonoOrder;
const USDRate = require("../models/usdRate").USDRate;
const FondyMerchant = require("../models/fondyMerchant").FondyMerchant;

const addDealToCrm = require("../lib/crm").addDealToCrm;
const addToCampaign = require("../lib/gr").addToCampaign;

const requestIp = require("request-ip");

const lang = require("../lang");
const { generateLink } = require("../lib/linkGen");
const frisbee = require("../lib/frisbee");


module.exports = function routes(app, passport) {
	router.get("/checkout/1", async (ctx) => {
		const labels = lang[getLangZone(ctx)].step1;

		if (ctx.request.query["productName"] && ctx.request.query["productID"] && ctx.request.query["productPrice"] && ctx.request.query["currency"] && ctx.request.query["merchantID"]) {
			await ctx.render("pages/client/checkout/step1", {
				productName     : ctx.request.query["productName"].replace(/\n/gi, "") || "",
				productID       : ctx.request.query["productID"] || "",
				productPrice    : ctx.request.query["productPrice"] || "",
				currency        : ctx.request.query["currency"] || "",
				// redirectURL : ctx.request.query["redirectURL"] || "",
				merchantID      : ctx.request.query["merchantID"] || "",
				landing         : ctx.request.query["landing"] || "false",
				convertationHide: ctx.request.query["convertationHide"] || "false",
				successLink     : ctx.request.query["successLink"] || "",
				payPalHide      : ctx.request.query["payPalHide"] || "",
				fondyHide       : ctx.request.query["fondyHide"] || "",
				monoHide        : ctx.request.query["monoHide"] || "",
				lang            : getLangZone(ctx),
				labels
			});
		} else {
			ctx.body = "Some of required fields are undefined";
		}
	});

	router.get("/checkout/2", async (ctx) => {
		const labels = lang[getLangZone(ctx)].step2;

		if (ctx.request.query["productName"] && ctx.request.query["email"] && ctx.request.query["firstName"] && ctx.request.query["phone"] && ctx.request.query["productPrice"] && ctx.request.query["productID"] && ctx.request.query["currency"] && ctx.request.query["merchantID"]) {
			await ctx.render("pages/client/checkout/step2", {
				productName     : ctx.request.query["productName"].replace(/\n/gi, "") || "",
				productID       : ctx.request.query["productID"] || "",
				email           : ctx.request.query["email"] || "",
				phone           : ctx.request.query["phone"] || "",
				productPrice    : ctx.request.query["productPrice"] || "",
				currency        : ctx.request.query["currency"] || "",
				merchantID      : ctx.request.query["merchantID"] || "",
				salesOrderID    : ctx.request.query["salesOrderID"] || "",
				firstName       : ctx.request.query["firstName"] || "",
				lastName        : ctx.request.query["lastName"] || "",
				landing         : ctx.request.query["landing"] || "",
				convertationHide: ctx.request.query["convertationHide"] || "false",
				successLink     : ctx.request.query["successLink"] || "",
				payPalHide      : ctx.request.query["payPalHide"] || "",
				fondyHide       : ctx.request.query["fondyHide"] || "",
				monoHide        : ctx.request.query["monoHide"] || "",
				USDRateUAH      : (await USDRate.findOne({ currency: "UAH" }).lean().select("price")).price,
				USDRateEUR      : (await USDRate.findOne({ currency: "EUR" }).lean().select("price")).price,
				USDRateRUB      : (await USDRate.findOne({ currency: "RUB" }).lean().select("price")).price,
				lang            : getLangZone(ctx),
				labels
			});
		} else {
			ctx.body = "Some of required fields are undefined";
		}
	});

	router.get("/checkout/2/fondy", async (ctx) => {
		const labels = lang[getLangZone(ctx)].step2_fondy;

		if (ctx.request.query["productName"] && ctx.request.query["email"] && ctx.request.query["firstName"] && ctx.request.query["phone"] && ctx.request.query["productPrice"] && ctx.request.query["productID"] && ctx.request.query["currency"] && ctx.request.query["merchantID"]) {
			await ctx.render("pages/client/checkout/step2_fondy", {
				productName     : ctx.request.query["productName"].replace(/\n/gi, "") || "",
				productID       : ctx.request.query["productID"] || "",
				email           : ctx.request.query["email"] || "",
				phone           : ctx.request.query["phone"] || "",
				productPrice    : ctx.request.query["productPrice"] || "",
				currency        : ctx.request.query["currency"] || "",
				// redirectURL : ctx.request.query["redirectURL"] || "",
				merchantID      : ctx.request.query["merchantID"] || "",
				salesOrderID    : ctx.request.query["salesOrderID"] || "",
				firstName       : ctx.request.query["firstName"] || "",
				lastName        : ctx.request.query["lastName"] || "",
				landing         : ctx.request.query["landing"] || "",
				convertationHide: ctx.request.query["convertationHide"] || "false",
				successLink     : ctx.request.query["successLink"] || "",
				lang            : getLangZone(ctx),
				labels
			});
		} else {
			ctx.body = "Some of required fields are undefined";
		}
	});

	router.get("/checkout/2/fondy/currencies", async (ctx) => {
		const labels = lang[getLangZone(ctx)].step2_fondy_currencies;

		if (ctx.request.query["productName"] && ctx.request.query["email"] && ctx.request.query["firstName"] && ctx.request.query["phone"] && ctx.request.query["productPrice"] && ctx.request.query["productID"] && ctx.request.query["currency"] && ctx.request.query["merchantID"]) {
			await ctx.render("pages/client/checkout/step2_fondy_currencies", {
				productName     : ctx.request.query["productName"].replace(/\n/gi, "") || "",
				email           : ctx.request.query["email"] || "",
				phone           : ctx.request.query["phone"] || "",
				productPrice    : ctx.request.query["productPrice"] || "",
				productID       : ctx.request.query["productID"] || "",
				currency        : ctx.request.query["currency"] || "",
				// redirectURL : ctx.request.query["redirectURL"] || "",
				merchantID      : ctx.request.query["merchantID"] || "",
				salesOrderID    : ctx.request.query["salesOrderID"] || "",
				firstName       : ctx.request.query["firstName"] || "",
				lastName        : ctx.request.query["lastName"] || "",
				landing         : ctx.request.query["landing"] || "",
				convertationHide: ctx.request.query["convertationHide"] || "false",
				successLink     : ctx.request.query["successLink"] || "",
				merchantUSD     : merchantUSD,
				merchantEUR     : merchantEUR,
				merchantUAH     : merchantUAH,
				merchantRUB     : merchantRUB,
				USDRateUAH      : (await USDRate.findOne({ currency: "UAH" }).lean().select("price")).price,
				USDRateEUR      : (await USDRate.findOne({ currency: "EUR" }).lean().select("price")).price,
				USDRateRUB      : (await USDRate.findOne({ currency: "RUB" }).lean().select("price")).price,
				lang            : getLangZone(ctx),
				labels
			});
		} else {
			ctx.body = "Some of required fields are undefined";
		}
	});

	router.get("/checkout/2/paypal", async (ctx) => {
		const labels = lang[getLangZone(ctx)].step2_paypal;

		if (ctx.request.query["productName"] && ctx.request.query["email"] && ctx.request.query["firstName"] && ctx.request.query["phone"] && ctx.request.query["productPrice"] && ctx.request.query["productID"] && ctx.request.query["currency"] && ctx.request.query["merchantID"]) {
			await ctx.render("pages/client/checkout/step2_paypal", {
				productName : ctx.request.query["productName"].replace(/\n/gi, "") || "",
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
				successLink : ctx.request.query["successLink"] || "",
				lang        : getLangZone(ctx),
				labels
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
		const labels = lang[getLangZone(ctx)].step3;

		const successLink = ctx.request.query["successLink"] || "";

		if (successLink) {
			await ctx.redirect(successLink);
		} else {
			await ctx.render("pages/client/checkout/step3", {
				productName: ctx.request.query["productName"].replace(/\n/gi, "") || "",
				lang       : getLangZone(ctx),
				labels
			});
		}
	}

	router.post("/getresponse", async (ctx) => {
		/**
		 * email, name, campaign – required fields
		 */

		if (ctx.request.body) {
			if (!ctx.request.body.email) {
				ctx.body = {
					result: 0,
					error : "Required field 'email' is undefined"
				};
			} else if (!ctx.request.body.name) {
				ctx.body = {
					result: 0,
					error : "Required field 'name' is undefined"
				};
			} else if (!ctx.request.body.campaign) {
				ctx.body = {
					result: 0,
					error : "Required field 'campaign' is undefined"
				};
			} else {
				// ctx.body = await zoho.searchContactOrAddNew(ctx.request.body);
				const customFields = {};
				if (ctx.request.body.phone) {
					customFields["phone"] = ctx.request.body.phone;
				}

				addToCampaign(ctx.request.body.name, ctx.request.body.email, ctx.request.body.campaign, 0, "", [customFields]);
				ctx.body = {
					result: 1
				};
			}
		} else {
			ctx.body = {
				result: 0,
				error : "Bad request. Body is undefined"
			};
		}
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
			} else {
				const geoData = (await getGeo(ctx)) || {};
				ctx.body = await zoho.searchContactOrAddNew(ctx.request.body, geoData);
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
				const geoData = (await getGeo(ctx)) || {};
				ctx.body = await zoho.searchDeal(ctx.request.body, geoData);
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
		 * Email, productID, productName, First_Name – required fields
		 * Amount, utm_campaign, utm_medium, utm_source, utm_term, utm_content, http_refferer, Country, City, Time_zone, sposob_svyazi – optionals fields
		 */

		if (ctx.request.body) {
			if (!ctx.request.body.Email) {
				ctx.body = {
					result: 0,
					error : "Required field 'Email' is undefined"
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
				const geoData = (await getGeo(ctx)) || {};
				ctx.body = await zoho.createDeal(ctx.request.body, geoData);
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
				const geoData = (await getGeo(ctx)) || {};
				ctx.body = await zoho.updateDeal(ctx.request.body, geoData);
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
				const geoData = (await getGeo(ctx)) || {};
				ctx.body = await zoho.createSalesOrder(ctx.request.body, geoData);
			}
		} else {
			ctx.body = {
				result: 0,
				error : "Bad request. Body is undefined"
			};
		}
	});

	router.post("/visit", async (ctx) => {
		/**
		 * Email, Event_Name, productID, productName, First_Name – required fields
		 * contactID, dealID, Last_Name, utm_campaign, utm_medium, utm_source, utm_term, utm_content, http_refferer – optionals fields
		 */

		if (ctx.request.body) {
			if (!ctx.request.body.Email) {
				ctx.body = {
					result: 0,
					error : "Required field 'Email' is undefined"
				};
			} else if (!ctx.request.body.Event_Name) {
				ctx.body = {
					result: 0,
					error : "Required field 'Event_Name' is undefined"
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
				const geoData = (await getGeo(ctx)) || {};
				ctx.body = await zoho.createVisit(ctx.request.body, geoData);
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

	router.post("/fondy/payment/rectoken", async (ctx) => {
		ctx.body = await Fondy.createPaymentByRectoken(ctx.request.body);
	});

	router.post("/fondy/callback", async (ctx) => {
		ctx.status = await Fondy.processCallback(ctx.request.body);
	});

	router.post("/frisbee/payment/rectoken", async (ctx) => {
		ctx.body = await Fondy.createPaymentByRectoken(ctx.request.body);
	});

	router.post("/frisbee/payment", async (ctx) => {
		ctx.body = await frisbee.createPayment(ctx.request.body);
	});

	router.post("/frisbee/callback", async (ctx) => {
		ctx.status = await frisbee.processCallback(ctx.request.body);
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

	// router.get("/monobank", async (ctx) => {
	// 	await ctx.render("pages/client/monobank");
	// });

	router.post("/monobank/validatePhone", async (ctx) => {
		ctx.body = await Monobank.validateClient(ctx.request.body.phone);
	});

	router.post("/monobank/order", async (ctx) => {
		const date = new Date();
		const year = date.getFullYear();
		const month = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString();
		const day = (date.getDate() < 10) ? "0" + date.getDate().toString() : date.getDate().toString();
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

	router.post("/monobank/reject", async (ctx) => {
		console.log("BODY:", ctx.request.body);
		ctx.body = await Monobank.rejectOrder(ctx.request.body.orderID);
	});

	router.post("/monobank/return", async (ctx) => {
		console.log("BODY:", ctx.request.body);
		ctx.body = await Monobank.returnOrder(ctx.request.body);
	});

	router.post("/monobank/callback", async (ctx) => {
		await Monobank.processCallback(ctx.request.body);
		ctx.status = 200;
	});

	router.get("/monobank/process", async (ctx) => {
		await ctx.render("pages/client/monobank-process");
	});

	router.get("/monobank/success", async (ctx) => {
		await ctx.render("pages/client/monobank-success");
	});

	router.get("/monobank/failure", async (ctx) => {
		await ctx.render("pages/client/monobank-failure");
	});

	//MONOBANK LOGIC PROD =>
	router.get("/monobank/:page_id", async (ctx) => {
		try {
			const page = await Page.findOne({ page_id: parseInt(ctx.params.page_id, 10) });

			if (page) {
				if (page.parts.length > 0) {
					await ctx.render("pages/client/monobank/checkout", {
						page
					});
				} else {
					await ctx.render("pages/error404");
				}
			} else {
				await ctx.render("pages/error404");
			}
		} catch (err) {
			eLogger.error(err);
			await ctx.render("pages/error404");
		}
	});

	router.post("/monobank/:page_id/order", async (ctx) => {
		try {
			const page = await Page.findOne({ page_id: parseInt(ctx.params.page_id, 10) });
			const usdRatePrice = (parseFloat((await USDRate.findOne({ currency: "UAH" }).lean()).price).toFixed(2)) || 0;

			if (page) {
				const date = new Date();
				const year = date.getFullYear();
				const month = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString();
				const day = (date.getDate() < 10) ? "0" + date.getDate().toString() : date.getDate().toString();
				let dateStr = year + "-" + month + "-" + day;

				const data = {
					client_phone      : ctx.request.body.phone,
					total_sum         : (usdRatePrice * parseFloat(page.price)).toFixed(2),
					invoice           : {
						date  : dateStr,
						source: "INTERNET"
					},
					available_programs: [{
						available_parts_count: page.parts,
						type                 : "payment_installments"
					}],
					products          : [{
						name : page.name,
						count: 1,
						sum  : (usdRatePrice * parseFloat(page.price)).toFixed(2)
					}],
					result_callback   : config.get("url") + "monobank/" + page.page_id + "/callback",
					email             : ctx.request.body.email,
					name              : ctx.request.body.name,
					page              : page
				};

				if (page.crm1) {
					addDealToCrm(ctx.request.body.name, ctx.request.body.email, ctx.request.body.phone, page.crm1);
				}

				if (page.gr1) {
					addToCampaign(ctx.request.body.name, ctx.request.body.email, page.gr1, 0, "", [{ phone: ctx.request.body.phone }]);
				}

				ctx.body = await Monobank.createOrder(data);
			} else {
				ctx.body = {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(err);
			ctx.body = {
				result: 0
			};
		}
	});

	router.post("/monobank/:page_id/confirm", async (ctx) => {
		ctx.body = await Monobank.confirmDelivery(ctx.request.body.orderID);
	});

	router.post("/monobank/:page_id/callback", async (ctx) => {
		await Monobank.processCallback(ctx.request.body);
		ctx.status = 200;
	});

	router.get("/monobank/:page_id/success", async (ctx) => {
		try {
			const page = await Page.findOne({ page_id: ctx.params.page_id });
			const usdRate = config.get("monobank:usd_rate");

			await ctx.render("pages/client/monobank-success", {
				page,
				usdRate
			});
		} catch (err) {
			eLogger.error(err);
			ctx.body = {
				result: 0
			};
		}
	});

	// router.get("/mbtest", async (ctx) => {
	// 	await ctx.render("pages/client/monobank-test-page");
	// });

	router.post("/monobank/parts/callback", async (ctx) => {
		await Monobank.processCallback(ctx.request.body);
		ctx.status = 200;
	});

	router.post("/monobank/parts", async (ctx) => {
		try {
			const allowedCurrency = ["UAH", "USD"];

			if (ctx.request.body.currency) {
				if (allowedCurrency.includes(ctx.request.body.currency.toUpperCase())) {
					const date = new Date();
					const year = date.getFullYear();
					const month = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString();
					const day = (date.getDate() < 10) ? "0" + date.getDate().toString() : date.getDate().toString();
					const dateStr = year + "-" + month + "-" + day;

					const parts = [];
					if (ctx.request.body.parts) {
						parts.push(parseInt(ctx.request.body.parts, 10));
					}

					const data = {
						client_phone      : ctx.request.body.phone,
						total_sum         : 0,
						invoice           : {
							date  : dateStr,
							source: "INTERNET"
						},
						available_programs: [{
							available_parts_count: parts,
							type                 : "payment_installments"
						}],
						products          : [{
							name : ctx.request.body.productName,
							count: 1,
							sum  : 0
						}],
						result_callback   : config.get("url") + "monobank/parts/callback",
						email             : ctx.request.body.email,
						name              : ctx.request.body.name,
						product_name      : ctx.request.body.productName
					};

					if (ctx.request.body.currency.toUpperCase() === "USD") {
						const rate = (parseFloat((await USDRate.findOne({ currency: "UAH" }).lean()).price).toFixed(2)) || 0;
						if (rate) {
							data.total_sum = (rate * parseFloat(ctx.request.body.price)).toFixed(2);
							data.products[0].sum = (rate * parseFloat(ctx.request.body.price)).toFixed(2);

							if (ctx.request.body.grUnpaid) {
								addToCampaign(ctx.request.body.name, ctx.request.body.email, ctx.request.body.grUnpaid, 0, "", [{ phone: ctx.request.body.phone }]);
							}

							ctx.body = await Monobank.createOrder(data);
						} else {
							ctx.body = {
								result: 0
							};
						}
					} else if (ctx.request.body.currency.toUpperCase() === "UAH") {
						data.total_sum = (parseFloat(ctx.request.body.price)).toFixed(2);
						data.products[0].sum = (parseFloat(ctx.request.body.price)).toFixed(2);

						if (ctx.request.body.grUnpaid) {
							addToCampaign(ctx.request.body.name, ctx.request.body.email, ctx.request.body.grUnpaid, 0, "", [{ phone: ctx.request.body.phone }]);
						}

						ctx.body = await Monobank.createOrder(data);
					}
				} else {
					ctx.body = {
						result: 0
					};
				}
			} else {
				ctx.body = {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(err);
			ctx.body = {
				result: 0
			};
		}
	});

	router.post("/monobank/order_status", async (ctx) => {
		try {
			const order = await MonoOrder.findOne({ mono_order_id: ctx.request.body.order_id });

			if (order) {
				let status = "Неоплачен";

				if (order.state) {
					status = order.state;
				}

				ctx.body = {
					result: 1,
					status
				};
			} else {
				ctx.body = {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(err);
			ctx.body = {
				result: 0
			};
		}
	});

	//MONOBANK LOGIC PROD <=

	router.get("/zoho/payment/link", async (ctx) => {
		ctx.body = await generateLink(ctx);
	});

	// TILDA routes =>
	router.post("/tilda/form", async (ctx) => {
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
			} else {
				const geoData = (await getGeo(ctx)) || {};
				ctx.body = await zoho.searchContactAndUpdateOrAddNew(ctx.request.body, geoData);
			}
		} else {
			ctx.body = {
				result: 0,
				error : "Bad request. Body is undefined"
			};
		}
	});

	router.post("/tilda/create_deal", async (ctx) => {
		/**
		 * Email, productID, productName, First_Name – required fields
		 * Amount, utm_campaign, utm_medium, utm_source, utm_term, utm_content, http_refferer, Country, City, Time_zone – optionals fields
		 */

		if (ctx.request.body) {
			if (!ctx.request.body.Email) {
				ctx.body = {
					result: 0,
					error : "Required field 'Email' is undefined"
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
			} else {
				if (ctx.request.body.Name) {
					ctx.request.body.First_Name = ctx.request.body.Name;
				}

				if (!ctx.request.body.First_Name) {
					ctx.body = {
						result: 0,
						error : "Required field 'First_Name' is undefined"
					};
				} else {
					const geoData = (await getGeo(ctx)) || {};
					ctx.body = await zoho.createDeal(ctx.request.body, geoData);
				}
			}
		} else {
			ctx.body = {
				result: 0,
				error : "Bad request. Body is undefined"
			};
		}
	});
	// TILDA routes <=

	router.get("/admin", async (ctx) => {
		if (ctx.isAuthenticated()) {
			await ctx.redirect("/admin/pages");
		} else {
			await ctx.render("pages/admin/login");
		}
	});

	router.post("/admin/login", async (ctx, next) => {
		await passport.authenticate("local", (err, data, message) => {
			if (err) {
				eLogger.error(err);
				ctx.session.error = "Пробема доступа к БД";
				ctx.redirect("/admin");
			} else if (!data) {
				ctx.session.error = message.message;
				ctx.redirect("/admin");
			} else {
				new Promise((resolve) => {
					ctx.login(data);
					resolve();
				})
					.then(() => {
						ctx.redirect("/admin");
					});
			}
		})(ctx, next);
	});

	router.get("/admin/logout", async (ctx) => {
		ctx.session = null;
		ctx.logout();
		ctx.redirect("/admin");
	});

	router.get("/admin/pages", async (ctx) => {
		if (ctx.isAuthenticated()) {
			await ctx.render("pages/admin/pages-list");
		} else {
			await ctx.redirect("/admin");
		}
	});

	router.get("/admin/pages/new", async (ctx) => {
		if (ctx.isAuthenticated()) {
			await ctx.render("pages/admin/pages-new");
		} else {
			await ctx.redirect("/admin");
		}
	});

	router.post("/admin/pages/new", async (ctx) => {
		if (ctx.isAuthenticated()) {
			try {
				const parts = [];
				if (ctx.request.body.parts) {
					parts.push(parseInt(ctx.request.body.parts, 10));
					/*for (let i = 0; i < ctx.request.body.parts.length; i++) {
						parts.push(parseInt(ctx.request.body.parts[i], 10));
					}*/
				}

				await Page.create({
					name       : ctx.request.body.name || "",
					description: ctx.request.body.description || "",
					price      : ctx.request.body.price || 0,
					gr1        : ctx.request.body.gr1.trim() || "",
					gr2        : ctx.request.body.gr2.trim() || "",
					crm1       : ctx.request.body.crm1.trim() || "",
					crm2       : ctx.request.body.crm2.trim() || "",
					parts      : parts
				});

				await ctx.redirect("/admin/pages");
			} catch (err) {
				eLogger.error(err);
				await ctx.render("pages/error404");
			}
		} else {
			await ctx.redirect("/admin");
		}
	});

	router.get("/admin/pages/list", async (ctx) => {
		const list = {
			data: []
		};

		if (ctx.isAuthenticated()) {
			try {
				const pages = await Page.find().lean();

				for (let i = 0; i < pages.length; i++) {
					const page = pages[i];

					list.data.push([
						page.page_id,
						page.name,
						page.description,
						page.page_id,
						null
					]);
				}

				ctx.body = list;
			} catch (err) {
				eLogger.error(err);
				ctx.body = list;
			}
		} else {
			ctx.body = list;
		}
	});

	router.get("/admin/pages/:page_id/edit", async (ctx) => {
		if (ctx.isAuthenticated()) {
			const page = await Page.findOne({ page_id: ctx.params.page_id });

			await ctx.render("pages/admin/pages-edit", {
				page
			});
		} else {
			await ctx.redirect("/admin");
		}
	});

	router.post("/admin/pages/:page_id/edit", async (ctx) => {
		if (ctx.isAuthenticated()) {
			const page = await Page.findOne({ page_id: ctx.params.page_id });

			const parts = [];
			if (ctx.request.body.parts) {
				parts.push(parseInt(ctx.request.body.parts, 10));
				/*for (let i = 0; i < ctx.request.body.parts.length; i++) {
					parts.push(parseInt(ctx.request.body.parts[i], 10));
				}*/
			}

			page.name = ctx.request.body.name || "";
			page.description = ctx.request.body.description || "";
			page.price = ctx.request.body.price || 37.04;
			page.gr1 = ctx.request.body.gr1.trim() || "";
			page.gr2 = ctx.request.body.gr2.trim() || "";
			page.crm1 = ctx.request.body.crm1.trim() || "";
			page.crm2 = ctx.request.body.crm2.trim() || "";

			page.parts = parts;

			await page.save();

			await ctx.redirect("/admin/pages");
		} else {
			await ctx.redirect("/admin");
		}
	});

	router.get("/admin/pages/:page_id/delete", async (ctx) => {
		if (ctx.isAuthenticated()) {
			try {
				const page = await Page.findOne({ page_id: ctx.params.page_id });

				if (page) {
					await page.remove();

					ctx.body = { result: 1 };
				} else {
					ctx.body = { result: 0 };
				}
			} catch (err) {
				eLogger.error(err);
				ctx.body = { result: 0 };
			}
		} else {
			ctx.body = { result: 0 };
		}
	});

	router.get("/admin/merchants", async (ctx) => {
		if (ctx.isAuthenticated()) {
			await ctx.render("pages/admin/merchants-list");
		} else {
			await ctx.redirect("/admin");
		}
	});

	router.get("/admin/merchants/list", async (ctx) => {
		const list = {
			data: []
		};

		if (ctx.isAuthenticated()) {
			try {
				const merchants = await FondyMerchant.find().lean();

				for (let i = 0; i < merchants.length; i++) {
					const merchant = merchants[i];

					list.data.push([
						merchant.ID,
						merchant.password,
						merchant.fondy_merchant_id
					]);
				}

				ctx.body = list;
			} catch (err) {
				eLogger.error(err);
				ctx.body = list;
			}
		} else {
			ctx.body = list;
		}
	});

	router.get("/admin/merchants/new", async (ctx) => {
		if (ctx.isAuthenticated()) {
			await ctx.render("pages/admin/merchants-new");
		} else {
			await ctx.redirect("/admin");
		}
	});

	router.post("/admin/merchants/new", async (ctx) => {
		if (ctx.isAuthenticated()) {
			try {
				const merchantExists = await FondyMerchant.findOne({ ID: ctx.request.body.ID.trim() }).lean();

				if (!merchantExists) {
					await FondyMerchant.create({
						ID      : ctx.request.body.ID.trim(),
						password: ctx.request.body.password.trim()
					});

					await ctx.redirect("/admin/merchants");
				} else {
					await ctx.render("pages/error404");
				}
			} catch (err) {
				eLogger.error(err);
				await ctx.render("pages/error404");
			}
		} else {
			await ctx.redirect("/admin");
		}
	});

	router.get("/admin/merchants/:fondy_merchant_id/edit", async (ctx) => {
		if (ctx.isAuthenticated()) {
			const merchant = await FondyMerchant.findOne({ fondy_merchant_id: ctx.params.fondy_merchant_id }).lean();

			await ctx.render("pages/admin/merchants-edit", {
				merchant
			});
		} else {
			await ctx.redirect("/admin");
		}
	});

	router.post("/admin/merchants/:fondy_merchant_id/edit", async (ctx) => {
		if (ctx.isAuthenticated()) {
			const merchant = await FondyMerchant.findOne({ fondy_merchant_id: ctx.params.fondy_merchant_id });

			const merchantExists = await FondyMerchant.findOne({ ID: ctx.request.body.ID.trim() }).lean();
			if (!merchantExists || (merchantExists && (merchant.fondy_merchant_id === merchantExists.fondy_merchant_id))) {
				merchant.ID = ctx.request.body.ID.trim();
				merchant.password = ctx.request.body.password.trim();

				await merchant.save();

				await ctx.redirect("/admin/merchants");
			} else {
				await ctx.render("pages/error404");
			}
		} else {
			await ctx.redirect("/admin");
		}
	});

	router.get("/admin/merchants/:fondy_merchant_id/delete", async (ctx) => {
		if (ctx.isAuthenticated()) {
			try {
				const merchant = await FondyMerchant.findOne({ fondy_merchant_id: ctx.params.fondy_merchant_id });

				if (merchant) {
					await merchant.remove();

					ctx.body = { result: 1 };
				} else {
					ctx.body = { result: 0 };
				}
			} catch (err) {
				eLogger.error(err);
				ctx.body = { result: 0 };
			}
		} else {
			ctx.body = { result: 0 };
		}
	});

	router.get("/admin/orders", async (ctx) => {
		if (ctx.isAuthenticated()) {
			await ctx.render("pages/admin/orders-list");
		} else {
			await ctx.redirect("/admin");
		}
	});

	router.get("/admin/orders/list", async (ctx) => {
		const list = {
			data: []
		};

		if (ctx.isAuthenticated()) {
			try {
				const data = ctx.query;
				const queryOrder = {};

				if (data["search[value]"]) {
					queryOrder["$or"] = [
						{ client_phone: new RegExp(".*" + data["search[value]"].replace(/(\W)/g, "\\$1") + ".*", "i") }
					];
				}

				const orders = await MonoOrder.find(queryOrder)
					.populate({
						"path": "page"
					})
					.sort("-mono_order_id")
					.skip(parseInt(data.start, 10))
					.limit(parseInt(data.length, 10))
					.lean();

				list.recordsTotal = await MonoOrder.find().count();
				list.recordsFiltered = await MonoOrder.find(queryOrder).count();

				for (let i = 0; i < orders.length; i++) {
					const order = orders[i];

					let productName = order.product_name ? order.product_name : "";
					if (order.page) {
						productName = order.page.name;
					}

					let reversed = "Нет";
					if (order.returned || order.rejected) {
						reversed = "Да";
					}

					let status = "";
					if (order.state) {
						status = order.state;

						if (order.sub_state) {
							status += " (" + order.sub_state + ")";
						}
					}

					list.data.push([
						order.mono_order_id,
						order.name,
						order.client_phone,
						productName,
						status,
						order.total_sum.toFixed(2) || 0,
						reversed,
						null
					]);
				}

				ctx.body = list;
			} catch (err) {
				eLogger.error(err);
				ctx.body = list;
			}
		} else {
			ctx.body = list;
		}
	});

	router.get("/admin/orders/:order_id/return", async (ctx) => {
		try {
			if (ctx.isAuthenticated()) {
				const order = await MonoOrder.findOne({ mono_order_id: parseInt(ctx.params.order_id, 10) });

				if (order) {
					const stateData = await Monobank.stateOrder(order.external_order_id);
					console.log("stateData", stateData);

					if (stateData.result) {
						if (stateData.data.state === "SUCCESS") {
							await Monobank.returnOrder({
								orderID             : order.external_order_id,
								return_money_to_card: true,
								sum                 : order.total_sum
							});

							order.returned = true;

							await order.save();
						} else {
							await Monobank.rejectOrder(order.external_order_id);

							order.rejected = true;

							await order.save();
						}
					}
				}
			}
		} catch (err) {
			eLogger.error(err);
		}

		await ctx.redirect("/admin/orders");
	});

	router.get("/admin/usdrates", async (ctx) => {
		try {
			if (ctx.isAuthenticated()) {
				const usdrates = await USDRate.find().lean();
				await ctx.render("pages/admin/usdrates-edit", {
					usdrates
				});
			} else {
				await ctx.redirect("/admin");
			}
		} catch (err) {
			eLogger.error(err);
			await ctx.redirect("/admin");
		}
	});

	router.post("/admin/usdrates", async (ctx) => {
		try {
			const usdrates = await USDRate.find();

			await (new Promise(resolve => {
				async.eachSeries(usdrates, (rate, cb) => {
					for (let key in ctx.request.body) {
						if (rate.currency === key) {
							rate.price = parseFloat(ctx.request.body[key]);

							break;
						}
					}

					rate.save((err) => {
						cb(err);
					});
				}, (err) => {
					if (err) {
						eLogger.error(err);
						resolve({
							result: 0
						});
					} else {
						resolve({
							result: 1
						});
					}
				});
			}));

			await ctx.redirect("/admin/usdrates");
		} catch (err) {
			eLogger.error(err);
			await ctx.redirect("/admin/usdrates");
		}
	});

	router.get("/admin/link_gen", async (ctx) => {
		try {
			await ctx.render("pages/admin/link-generator", {
				baseURL: config.get("url") || ""
			});
		} catch (err) {
			eLogger.error(err);
			await ctx.redirect("/admin");
		}
	});

	async function getGeo(ctx) {
		try {
			const ip = requestIp.getClientIp(ctx);

			return await new Promise(resolve => {
				const options = {
					method: "get",
					url   : "https://ipapi.co/" + ip + "/json/?key=" + config.get("ipapi:key")
				};
				request(options, function (error, response, body) {
					if (error) {
						eLogger.error(error);
						resolve({ result: 0 });
					} else {
						const bodyJSON = JSON.parse(body);
						bodyJSON.result = 1;
						resolve(bodyJSON);
					}
				});
			});
		} catch (err) {
			eLogger.error(err);
			return { result: 0 };
		}
	}

	/*router.get("/yandex/form", async (ctx) => {
		await ctx.render("pages/client/yandex");
	});

	router.post("/yandex/payment", async (ctx) => {
		ctx.body = await Yandex.createPayment(ctx.request.body);
	});

	router.post("/yandex/callback", async (ctx) => {
		ctx.status = await Yandex.processCallback(ctx.request.body);
	});*/

	function getLangZone(ctx) {
		let zone = "ru";
		if (ctx && ctx.request && ctx.request.query["lang"]) {
			switch (ctx.request.query["lang"]) {
				case "ru":
					zone = "ru";
					break;
				case "ua":
					zone = "ua";
					break;
				default:
					zone = "ru";
					break;
			}
		}

		return zone;
	}

	app.use(router.routes());
};
