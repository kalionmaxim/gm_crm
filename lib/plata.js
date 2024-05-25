const axios = require("axios");

const config = require("../config/config");
const eLogger = require("../lib/logger").eLogger;
const plataLogger = require("../lib/logger").plataLogger;
const zoho = require("../lib/zohoCRM");
const PlataOrder = require("../models/plataOrder").PlataOrder;

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

			const order = await PlataOrder.create({
				salesOrderID: data.salesOrderID,
				email: data.email,
				currency: data.currency,
				productPrice: data.productPrice,
				productName: data.productName,
			});

			const payload = {
				amount: data.productPrice * 100,
				ccy: 980,
				// ccy:
				// 	data.currency === "USD"
				// 		? 840
				// 		: data.currency === "EUR"
				// 		? 978
				// 		: 980,
				merchantPaymInfo: {
					destination: data.paymentDescription || undefined,
					comment: data.paymentDescription || undefined,
					customerEmails: [data.email],
					basketOrder: [
						{
							name: data.productName,
							qty: 1,
							sum: data.productPrice * 100,
							icon: `${SITE_URL}img/client-new/logo.svg`,
							code: createSlug(data.productName),
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

			const response = await axios.post(
				`${PLATA_API_URL}/merchant/invoice/create`,
				payload,
				{
					headers: {
						"X-Token": PLATA_TOKEN,
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
			console.log(data);
			plataLogger.info("plata process callback: ", JSON.stringify(data));

			return { result: 1, ...data };
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
