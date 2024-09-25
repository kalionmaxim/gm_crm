const axios = require("axios");

const config = require("../config/config");
const eLogger = require("../lib/logger").eLogger;
const plataLogger = require("../lib/logger").plataLogger;
const zoho = require("../lib/zohoCRM");
const PlataOrder = require("../models/plataOrder").PlataOrder;
const PlataMerchant = require("../models/plataMerchant").PlataMerchant;

const SITE_URL = config.get("url");
const PLATA_API_URL = "https://api.monobank.ua/api";
const PLATA_TOKEN = config.get("plata:token");

class Plata {
	async createPayment(data) {
		try {
			if (
				!data.salesOrderID ||
				!data.email ||
				!data.currency ||
				!data.productPrice ||
				!data.productName
			) {
				return {
					result: 0,
					error: "There is not enough data to process plata checkout",
				};
			}

			const productName = decodeURIComponent(data.productName);
			const name = data.name ? decodeURIComponent(data.name) : data.name;
			const phone = data.phone ? decodeURIComponent(data.phone) : data.phone;
			const email = data.email ? decodeURIComponent(data.email) : data.email;

			const order = await PlataOrder.create({
				salesOrderID: data.salesOrderID,
				name,
				phone,
				email,
				currency: data.currency,
				productPrice: data.productPrice,
				productName,
			});

			const payload = {
				amount: data.productPrice * 100,
				ccy:
					data.currency === "USD"
						? 840
						: data.currency === "EUR"
						? 978
						: 980,
				merchantPaymInfo: {
					destination: data.paymentDescription || undefined,
					comment: data.paymentDescription || undefined,
					customerEmails: [email],
					basketOrder: [
						{
							name: productName,
							qty: 1,
							sum: data.productPrice * 100,
							icon: `${SITE_URL}img/client-new/logo.svg`,
							code: createSlug(productName),
						},
					],
				},
				redirectUrl: data.redirectURL || `${SITE_URL}checkout/3`,
				webHookUrl: `${SITE_URL}plata/callback`,
			};

			plataLogger.info(
				`${data.email} plata order create with data: `,
				JSON.stringify(payload)
			);

			let plataToken = PLATA_TOKEN;

			// if (data.token) {
			// 	const plataMerchant = await PlataMerchant.findOne({ ID: data.token });
			// 	if (plataMerchant && plataMerchant.token) {
			// 		plataToken = plataMerchant.token;
			// 	}
			// }

			const activePlataToken = await PlataMerchant.findOne({ isActive: true }).select("token").lean();
			if (activePlataToken && activePlataToken.token) plataToken = activePlataToken.token;

			const response = await axios.post(
				`${PLATA_API_URL}/merchant/invoice/create`,
				payload,
				{
					headers: {
						"X-Token": plataToken,
					},
				}
			);

			order.invoiceId = response.data.invoiceId;
			await order.save();

			plataLogger.info(
				`plata checkout with invoiceId ${response.data.invoiceId} created: `,
				response.data.pageUrl
			);

			return { result: 1, ...response.data };
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0,
				error: err.message || "Unknown error",
			};
		}
	}

	async processCallback(data) {
		try {
			plataLogger.info("plata process callback: ", JSON.stringify(data));

			const invoiceId = data.invoiceId;
			if (!invoiceId) {
				return {
					result: 0,
					error: "No invoice id provided",
				};
			}

			const order = await PlataOrder.findOne({ invoiceId });
			if (!order) {
				return {
					result: 0,
					error: `Can't find plata order with ${invoiceId} invoice id`,
				};
			}

			order.status = data.status;

			if (data.status === "success" || data.status === "failure") {
				order.paymentInfo = data.paymentInfo;
			}

			if (data.status === "failure") {
				order.failureReason = data.failureReason;
				order.errCode = data.errCode;
			}

			if (data.status === "success") {
				order.finalAmount = data.finalAmount;

				if (
					order.salesOrderID &&
					order.productPrice &&
					order.currency
				) {
					const zohoPayload = {
						invoice: order.salesOrderID,
						sposob_oplaty: "Plata",
						total_sum: order.productPrice.toFixed(2),
						Currency: order.currency,
					};

					await zoho.createPayment(zohoPayload);
				}
			}

			await order.save();

			return { result: 1, data, order };
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0,
				error: err.message || "Unknown error",
			};
		}
	}
}

function cyrillicToLatin(text) {
	const cyrillicToLatinMap = {
		А: "A",
		Б: "B",
		В: "V",
		Г: "H",
		Д: "D",
		Е: "E",
		Є: "Ye",
		Ж: "Zh",
		З: "Z",
		И: "Y",
		І: "I",
		Ї: "Yi",
		Й: "Y",
		К: "K",
		Л: "L",
		М: "M",
		Н: "N",
		О: "O",
		П: "P",
		Р: "R",
		С: "S",
		Т: "T",
		У: "U",
		Ф: "F",
		Х: "Kh",
		Ц: "Ts",
		Ч: "Ch",
		Ш: "Sh",
		Щ: "Shch",
		Ю: "Yu",
		Я: "Ya",
		а: "a",
		б: "b",
		в: "v",
		г: "h",
		д: "d",
		е: "e",
		є: "ye",
		ж: "zh",
		з: "z",
		и: "y",
		і: "i",
		ї: "yi",
		й: "y",
		к: "k",
		л: "l",
		м: "m",
		н: "n",
		о: "o",
		п: "p",
		р: "r",
		с: "s",
		т: "t",
		у: "u",
		ф: "f",
		х: "kh",
		ц: "ts",
		ч: "ch",
		ш: "sh",
		щ: "shch",
		ю: "yu",
		я: "ya",
	};

	return text
		.split("")
		.map((char) => cyrillicToLatinMap[char] || char)
		.join("");
}

function createSlug(text) {
	let latinText = cyrillicToLatin(text);

	latinText = latinText.toLowerCase();
	latinText = latinText.replace(/\s+/g, "-");
	latinText = latinText.replace(/[^a-z0-9-]/g, "");

	return latinText;
}

module.exports = new Plata();
