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

const eLogger = require("../lib/logger").eLogger;

const Page = require("../models/page").Page;

module.exports = function routes(app, passport) {
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

			if (page) {
				const date = new Date();
				const year = date.getFullYear();
				const month = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString();
				const day = (date.getMonth() < 10) ? "0" + date.getMonth().toString() : date.getMonth().toString();
				let dateStr = year + "-" + month + "-" + day;

				const data = {
					client_phone      : ctx.request.body.phone,
					total_sum         : page.price.toFixed(2),
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
						sum  : page.price.toFixed(2)
					}],
					result_callback   : config.get("url") + "monobank/" + page.page_id + "/callback",
					email             : ctx.request.body.email,
					name              : ctx.request.body.name
				};

				//TODO: CRM and GR integration
				/*if (page.crm1) {

				}

				if (page.gr1) {

				}*/

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

	//MONOBANK LOGIC PROD <=

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
					for (let i = 0; i < ctx.request.body.parts.length; i++) {
						parts.push(parseInt(ctx.request.body.parts[i], 10));
					}
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
				await ctx.render("error404");
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
				for (let i = 0; i < ctx.request.body.parts.length; i++) {
					parts.push(parseInt(ctx.request.body.parts[i], 10));
				}
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

	/*router.get("/yandex/form", async (ctx) => {
		await ctx.render("pages/client/yandex");
	});

	router.post("/yandex/payment", async (ctx) => {
		ctx.body = await Yandex.createPayment(ctx.request.body);
	});

	router.post("/yandex/callback", async (ctx) => {
		ctx.status = await Yandex.processCallback(ctx.request.body);
	});*/

	app.use(router.routes());
};
