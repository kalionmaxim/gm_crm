/*
const sha1 = require("sha1");

const zoho = require("../lib/zohoCRM");*/

const config = require("../config/config");
const crypto = require("crypto");
const request = require("request");
const monoLogger = require("../lib/logger").monoLogger;
const eLogger = require("../lib/logger").eLogger;

const URL = config.get("monobank:url");
const STORE_ID = config.get("monobank:store_id");
const STORE_SECRET = config.get("monobank:store_secret");

const zoho = require("../lib/zohoCRM");

const MonoOrder = require("../models/monoOrder").MonoOrder;

const addDealToCrm = require("../lib/crm").addDealToCrm;
const addToCampaign = require("../lib/gr").addToCampaign;

class Monobank {
	async validateClient(phone) {
		try {
			const data = JSON.stringify({
				"phone": phone
			});

			const signData = await this.sign(data);

			if (signData && signData.result) {
				return new Promise((resolve) => {
					const options = {
						method : "POST",
						headers: {
							"store_id"    : STORE_ID,
							"signature"   : signData.sign,
							"Content-Type": "application/json",
							"Accept"      : "application/json"
						},
						body   : data
					};
					request(URL + "api/client/validate", options, (error, response, body) => {
						if (error) {
							eLogger.error(error);
							// monoLogger.error(error);
							resolve({
								result: 0
							});
						} else {
							// console.log("response", response);
							console.log("body", body);

							const data = JSON.parse(body);

							resolve({
								result: 1,
								data  : data
							});
						}
					});
				});
			} else {
				return {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0
			};
		}
	}

	async isOrderPaid(orderID) {
		try {
			const data = JSON.stringify({
				"order_id": orderID
			});

			const signData = await this.sign(data);

			if (signData && signData.result) {
				return new Promise((resolve) => {
					const options = {
						method : "POST",
						headers: {
							"store_id"    : STORE_ID,
							"signature"   : signData.sign,
							"Content-Type": "application/json",
							"Accept"      : "application/json"
						},
						body   : data
					};
					request(URL + "/api/order/check/paid", options, (error, response, body) => {
						if (error) {
							eLogger.error(error);
							resolve({
								result: 0
							});
						} else {
							console.log("body", body);
							resolve({
								result: 1,
								data  : JSON.parse(body)
							});
						}
					});
				});
			} else {
				return {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0
			};
		}
	}

	async confirmDelivery(orderID) {
		try {
			const data = JSON.stringify({
				"order_id": orderID
			});

			const signData = await this.sign(data);

			if (signData && signData.result) {
				return new Promise((resolve) => {
					const options = {
						method : "POST",
						headers: {
							"store_id"    : STORE_ID,
							"signature"   : signData.sign,
							"Content-Type": "application/json",
							"Accept"      : "application/json"
						},
						body   : data
					};
					request(URL + "/api/order/confirm", options, (error, response, body) => {
						if (error) {
							eLogger.error(error);
							resolve({
								result: 0
							});
						} else {
							console.log("body", body);
							resolve({
								result: 1,
								data  : JSON.parse(body)
							});
						}
					});
				});
			} else {
				return {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0
			};
		}
	}

	async createOrder(inputData) {
		try {
			const order = await MonoOrder.create(inputData);

			const object = {
				store_order_id    : order.mono_order_id,
				client_phone      : order.client_phone,
				total_sum         : order.total_sum,
				invoice           : {
					date  : order.invoice.date,
					number: order.mono_order_id,
					// point_id: order.invoice.point_id || "",
					source: order.invoice.source
				},
				result_callback   : order.result_callback,
				additional_params : order.additional_params,
				available_programs: [],
				products          : []
			};

			for (let i = 0; i < order.available_programs.length; i++) {
				const obj = {
					available_parts_count: []
				};

				obj.type = order.available_programs[i].type;

				for (let j = 0; j < order.available_programs[i].available_parts_count.length; j++) {
					obj.available_parts_count.push(order.available_programs[i].available_parts_count[j]);
				}

				object.available_programs.push(obj);
			}

			for (let i = 0; i < order.products.length; i++) {
				object.products.push({
					name : order.products[i].name,
					count: order.products[i].count,
					sum  : order.products[i].sum
				});
			}

			const data = JSON.stringify(object);
			console.log("PAYLOAD:", data);
			const signData = await this.sign(data);
			console.log("SIGN:", signData.sign);

			if (signData && signData.result) {
				return new Promise((resolve) => {
					const options = {
						method : "POST",
						headers: {
							"store_id"    : STORE_ID,
							"signature"   : signData.sign,
							"Content-Type": "application/json",
							"Accept"      : "application/json"
						},
						body   : data
					};

					console.log("HEADERS:", options.headers);

					request(URL + "/api/order/create", options, (error, response, body) => {
						if (error) {
							eLogger.error(error);
							resolve({
								result: 0
							});
						} else {
							console.log("RESPONSE:", body);

							const data = JSON.parse(body);

							if (data && data.order_id) {
								order.external_order_id = data.order_id;

								order.save((err) => {
									if (err) {
										eLogger.error(err);
									}

									resolve({
										result   : 1,
										data     : data,
										order_id : order.mono_order_id
									});
								});
							} else {
								resolve({
									result   : 1,
									data     : data,
									order_id : order.mono_order_id
								});
							}
						}
					});
				});
			} else {
				return {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0
			};
		}
	}

	async rejectOrder(orderID) {
		try {
			const data = JSON.stringify({
				"order_id": orderID
			});

			const signData = await this.sign(data);

			if (signData && signData.result) {
				return new Promise((resolve) => {
					const options = {
						method : "POST",
						headers: {
							"store_id"    : STORE_ID,
							"signature"   : signData.sign,
							"Content-Type": "application/json",
							"Accept"      : "application/json"
						},
						body   : data
					};
					request(URL + "/api/order/reject", options, (error, response, body) => {
						if (error) {
							eLogger.error(error);
							resolve({
								result: 0
							});
						} else {
							console.log("body", body);
							resolve({
								result: 1,
								data  : JSON.parse(body)
							});
						}
					});
				});
			} else {
				return {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0
			};
		}
	}

	async returnOrder(inputData) {
		try {
			const data = JSON.stringify({
				"order_id"            : inputData.orderID,
				"return_money_to_card": inputData.return_money_to_card,
				"store_return_id"     : inputData.orderID,
				"sum"                 : inputData.sum,
				"additional_params"   : inputData.additional_params
			});

			console.log("DATA:", data);

			const signData = await this.sign(data);

			if (signData && signData.result) {
				return new Promise((resolve) => {
					const options = {
						method : "POST",
						headers: {
							"store_id"    : STORE_ID,
							"signature"   : signData.sign,
							"Content-Type": "application/json",
							"Accept"      : "application/json"
						},
						body   : data
					};
					request(URL + "/api/order/return", options, (error, response, body) => {
						if (error) {
							eLogger.error(error);
							resolve({
								result: 0
							});
						} else {
							console.log("body", body);
							resolve({
								result: 1,
								data  : JSON.parse(body)
							});
						}
					});
				});
			} else {
				return {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0
			};
		}
	}

	async stateOrder(orderID) {
		try {
			const data = JSON.stringify({
				"order_id": orderID
			});

			const signData = await this.sign(data);

			if (signData && signData.result) {
				return new Promise((resolve) => {
					const options = {
						method : "POST",
						headers: {
							"store_id"    : STORE_ID,
							"signature"   : signData.sign,
							"Content-Type": "application/json",
							"Accept"      : "application/json"
						},
						body   : data
					};
					request(URL + "/api/order/state", options, (error, response, body) => {
						if (error) {
							eLogger.error(error);
							resolve({
								result: 0
							});
						} else {
							console.log("body", body);
							resolve({
								result: 1,
								data  : JSON.parse(body)
							});
						}
					});
				});
			} else {
				return {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0
			};
		}
	}

	async processCallback(data) {
		try {
			monoLogger.info(`Monobank processCallback data: ${data}`);
			monoLogger.info(`Monobank processCallback data (stringified): ${JSON.stringify(data)}`);
			console.log("Monobank processCallback data", data);
			const order = await MonoOrder.findOne({ external_order_id: data.order_id })
				.populate("page");

			if (order) {
				order.state = data.state;
				order.sub_state = data.order_sub_state;

				await order.save();

				if ((data.state === "IN_PROCESS") && (data.order_sub_state === "WAITING_FOR_STORE_CONFIRM")) {
					const respData = await this.confirmDelivery(data.order_id);

					if (respData.result) {
						order.state = respData.data.state;
						order.sub_state = respData.data.order_sub_state;

						await order.save();

						if (respData.data.state === "SUCCESS") {
							if (order.page) {
								if (order.page.crm2) {
									addDealToCrm(order.name, order.email, order.client_phone, order.page.crm2);
								}

								if (order.page.gr2) {
									addToCampaign(order.name, order.email, order.page.gr2, 0, "", [{ phone: order.client_phone }]);
								}
							}

							const data = {
								invoice       : order.salesOrderID,
								sposob_oplaty : "Monobank",
								total_sum     : order.total_sum,
								Currency      : "UAH",
								numberMonobank: order.mono_order_id
							};

							await zoho.createPaymentV3(data);
						}
					}
				} else if (data.state === "SUCCESS") {
					if (order.page) {
						if (order.page.crm2) {
							addDealToCrm(order.name, order.email, order.client_phone, order.page.crm2);
						}

						if (order.page.gr2) {
							addToCampaign(order.name, order.email, order.page.gr2, 0, "", [{ phone: order.client_phone }]);
						}
					}

					const data = {
						invoice       : order.salesOrderID,
						sposob_oplaty : "Monobank",
						total_sum     : order.total_sum,
						Currency      : "UAH",
						numberMonobank: order.mono_order_id
					};

					await zoho.createPaymentV3(data);
				}

				return {
					result: 1
				};
			} else {
				return {
					result: 0
				};
			}
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0
			};
		}
	}

	async sign(data) {
		try {
			const sign = crypto.createHmac("sha256", STORE_SECRET).update(data).digest("base64");

			console.log("sign", sign);

			return {
				result: 1,
				sign
			};
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0
			};
		}
	}

	async getCurrencyInfo (currencyCodeA, currencyCodeB) {
		try {
			return new Promise((resolve) => {
				const options = {
					method : "GET",
					headers: {
						"Content-Type": "application/json",
						"Accept"      : "application/json"
					}
				};
				request("https://api.monobank.ua/bank/currency", options, (error, response, body) => {
					if (error) {
						eLogger.error(error);
						resolve({
							result: 0
						});
					} else {
						if ((currencyCodeA && currencyCodeB) && (typeof currencyCodeA === "number" && typeof currencyCodeB === "number")) {
							const data = JSON.parse(body);

							if (data.errorDescription) {
								resolve({
									result : 0,
									error : data.errorDescription
								});
							} else {
								const currencyPair = data.filter((item) => {
									return item.currencyCodeA === currencyCodeA && item.currencyCodeB === currencyCodeB;
								})[0];

								resolve({
									result : 1,
									currencyPair
								});
							}
						} else {
							resolve({
								result : 1,
								data : JSON.parse(body)
							});
						}
					}
				});
			});
		} catch (err) {
			eLogger.error(err);
			return {
				result: 0
			};
		}
	}
}

module.exports = new Monobank();
