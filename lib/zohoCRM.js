const crmLogger = require("./logger").crmLogger;

const ZohoHelpers = require("./zohoHelpers");

class Zoho {
	async createPayment(data) {
		try {
			const salesOrder = await ZohoHelpers.getRecord("Sales_Orders", data.invoice);

			const date = new Date().toISOStringTimezoneOffset();

			const jsonData = {
				"Name"         : "Платеж – " + salesOrder.data[0].Deal_Name.name,
				"invoice"      : data.invoice,
				"oplata_time"  : date,
				"sposob_oplaty": data.sposob_oplaty,
				"total_sum"    : data.total_sum,
				"autooplata"   : true,
				"Status"       : "Оплачен",
				"Currency"     : data.Currency.toUpperCase()
			};

			const result = await ZohoHelpers.createRecord("Payments", jsonData, "approval, workflow, blueprint");

			if (result) {
				return {
					result   : 1,
					paymentID: result.data[0].details.id
				};
			} else {
				crmLogger.info("createPayment() – response from zoho is incorrect");
				return {
					result: 0,
					error : "Response from zoho is incorrect"
				};
			}
		} catch (err) {
			crmLogger.error(`createPayment() – ${err}`);
			return {
				result: 0,
				error : "Unknown error while creating payment"
			};
		}
	}

	async createSalesOrder(data, geoData) {
		try {
			let contactID = null;
			let dealID = null;
			if (data.contactID) {
				contactID = data.contactID;
			}

			if (data.dealID) {
				dealID = data.dealID;
			}

			if (!contactID) {
				const responseData = await this.searchDeal(data, geoData);

				contactID = responseData.contactID || null;
				dealID = responseData.dealID || null;
			}

			if (!dealID) {
				dealID = (await this.createDeal(data, geoData)).dealID;
			}

			if (contactID && dealID && data.productPrice && data.productID) {
				const jsonData = {
					"Subject"        : "Счет - " + data.productName + " – " + data.First_Name,
					"Status"         : "Новый",
					"Contact_Name"   : contactID,
					"Deal_Name"      : dealID,
					"vystav_sum"     : data.productPrice,
					"Grand_Total"    : data.productPrice,
					"Currency"       : data.currency.toUpperCase(),
					"autooplata"     : true,
					"Product_Details": [{
						"product"             : {
							"id": data.productID
						},
						"quantity"            : 1,
						"total_after_discount": data.productPrice,
						"net_total"           : data.productPrice,
						"list_price"          : parseFloat(data.productPrice),
						"unit_price"          : data.productPrice,
						"total"               : data.productPrice
					}]
				};

				const result = await ZohoHelpers.createRecord("Sales_Orders", jsonData, "approval, workflow, blueprint");

				if (result) {
					return {
						result      : 1,
						salesOrderID: result.data[0].details.id,
						dealID,
						contactID
					};
				} else {
					crmLogger.info("createSalesOrder() – response from zoho is incorrect");
					return {
						result: 0,
						error : "Response from zoho is incorrect",
						dealID,
						contactID
					};
				}
			} else {
				return {
					result: 0,
					error : "contactID/dealID/productID/productPrice is undefined"
				};
			}
		} catch (err) {
			crmLogger.error(`createSalesOrder() – ${err}`);
			return {
				result: 0,
				error : "Unknown error while creating sales order"
			};
		}
	}

	async updateDeal(data, geoData) {
		try {
			const jsonData = {};
			let dealID = null;

			for (let key in data) {
				if (key !== "dealID") {
					jsonData[key] = data[key];
				} else {
					dealID = data[key];
				}
			}

			if (!dealID) {
				dealID = (await this.searchDeal(data, geoData)).dealID;
			}

			if (!dealID) {
				dealID = (await this.createDeal(data)).dealID;
			}

			if (dealID) {
				const result = await ZohoHelpers.updateRecord("Deals", dealID, jsonData, "approval, workflow, blueprint");

				if (result) {
					return {
						result: 1,
						dealID: result.data[0].details.id
					};
				} else {
					crmLogger.info("createDeal() – response from zoho is incorrect");
					return {
						result: 0,
						error : "Response from zoho is incorrect"
					};
				}
			} else {
				return {
					result: 0,
					error : "\"dealID\" is undefined"
				};
			}
		} catch (err) {
			crmLogger.error(`createDeal() – ${err}`);
			return {
				result: 0,
				error : "Unknown error while creating deal"
			};
		}
	}

	async searchDeal(data, geoData) {
		try {
			let contactID = null;
			if (data.contactID) {
				contactID = data.contactID;
			} else {
				if (!data.Email) {
					return {
						result: 0,
						error : "Field \"Email\" required, but it is undefined"
					};
				} else if (!data.Phone) {
					return {
						result: 0,
						error : "Field \"Phone\" required, but it is undefined"
					};
				} else if (!data.First_Name) {
					return {
						result: 0,
						error : "Field \"First_Name\" required, but it is undefined"
					};
				} else {
					contactID = (await this.searchContactOrAddNew(data, geoData)).contactID;
				}
			}

			if (contactID) {
				data.contactID = contactID;

				if (data.productID) {
					const dealsData = await ZohoHelpers.getDeals(contactID);
					let deals = [];
					if (dealsData && (typeof (dealsData.data) === "object") && (dealsData.data instanceof Array) && (dealsData.data.length > 0)) {
						deals = dealsData.data;
					}

					let dealID = null;
					for (let i = 0; i < deals.length; i++) {
						const deal = deals[i];

						if (deal && deal.product) {
							if (deal.product.id.toString() === data.productID.toString()) {
								dealID = deal.id;
								break;
							}
						}
					}

					if (!dealID) {
						dealID = (await this.createDeal(data)).dealID || null;
					}

					return {
						result: 1,
						dealID,
						contactID
					};
				} else {
					return {
						result: 0,
						error : "Can't find deal, because productID is undefined",
						contactID
					};
				}
			} else {
				return {
					result: 0,
					error : "Can't find deal, because contactID is undefined"
				};
			}
		} catch (err) {
			crmLogger.error(`createDeal() – ${err}`);
			return {
				result: 0,
				error : "Unknown error while searching deal"
			};
		}
	}

	async createDeal(data, geoData) {
		try {
			let contactID = null;
			if (data.contactID) {
				contactID = data.contactID;
			} else {
				contactID = (await this.searchContactOrAddNew(data)).contactID || null;
			}

			let referrer = "";
			if (data.http_refferer) {
				if (data.http_refferer.length >= 255) {
					referrer = data.http_refferer.substr(0, 254);
				} else {
					referrer = data.http_refferer;
				}
			}

			let country = "";
			if (geoData && geoData.country_name) {
				country = geoData.country_name;
			}

			let city = "";
			if (geoData && geoData.city) {
				city = geoData.city;
			}

			let timezone = "";
			if (geoData && geoData.utc_offset) {
				timezone = "UTC" + geoData.utc_offset;
			}

			if (contactID) {
				const jsonData = {
					"Deal_Name"    : data.productName + " – " + data.First_Name,
					"Stage"        : data.Stage || "7. Обучение завершено",
					"s_lenda"      : true,
					"Contact_Name" : contactID,
					"lead_status"  : data.lead_status || "Зарегистрирован",
					"product"      : data.productID,
					"Phone"        : data.Phone,
					"Email"        : data.Email,
					"utm_campaign" : data.utm_campaign || "",
					"utm_medium"   : data.utm_medium || "",
					"utm_source"   : data.utm_source || "",
					"utm_term"     : data.utm_term || "",
					"utm_content"  : data.utm_content || "",
					"http_refferer": referrer,
					"Amount"       : data.Amount || 0,
					"Country"      : country,
					"City"         : city,
					"Time_zone"    : timezone
				};

				const result = await ZohoHelpers.createRecord("Deals", jsonData, "approval, workflow, blueprint");

				if (result) {
					return {
						result: 1,
						dealID: result.data[0].details.id,
						contactID
					};
				} else {
					crmLogger.info("createDeal() – response from zoho is incorrect");
					return {
						result: 0,
						error : "Response from zoho is incorrect"
					};
				}
			} else {
				return {
					result: 0,
					error : "contactID is undefined"
				};
			}
		} catch (err) {
			crmLogger.error(`createDeal() – ${err}`);
			return {
				result: 0,
				error : "Unknown error while creating deal"
			};
		}
	}

	async updateContact(data) {
		try {
			const jsonData = {};
			let contactID = null;

			for (let key in data) {
				if (key !== "contactID") {
					jsonData[key] = data[key];
				} else {
					contactID = data[key];
				}
			}

			const result = await ZohoHelpers.updateRecord("Contacts", contactID, jsonData, "approval, workflow, blueprint");

			if (result) {
				return {
					result   : 1,
					contactID: result.data[0].details.id
				};
			} else {
				crmLogger.info("createContact() – response from zoho is incorrect");
				return {
					result: 0,
					error : "Response from zoho is incorrect"
				};
			}
		} catch (err) {
			crmLogger.error(`updateContact() – ${err}`);
			return {
				result: 0,
				error : "Unknown error while updating contact"
			};
		}
	}

	async searchContactOrAddNew(data, geoData) {
		try {
			let contactID = (await this.searchContact(data)).contactID || null;
			if (!contactID) {
				contactID = (await this.createContact(data, geoData)).contactID || null;
			}

			return {
				result: 1,
				contactID
			};
		} catch (err) {
			crmLogger.error(`searchContactOrAddNew() – ${err}`);
			return {
				result: 0,
				error : "Unknown error while searching/creating contact"
			};
		}
	}

	async searchContact(data) {
		try {
			let criteria = "";
			if (data.Email && data.Phone) {
				criteria = "((Email:equals:" + data.Email + ")or(Phone:equals:" + data.Phone.replace(/[\(\)]/g, "").replace(/ /g, "") + "))";
			} else {
				if (data.Email) {
					criteria = "(Email:equals:" + data.Email + ")";
				} else if (data.Phone) {
					criteria = "(Phone:equals:" + data.Phone.replace(/[\(\)]/g, "").replace(/ /g, "") + ")";
				} else {
					crmLogger.info("searchContact() – email and/or phone are undefined");
					return {
						result: 0,
						error : "Email and phone are undefined. Can't find any record"
					};
				}
			}

			const result = await ZohoHelpers.searchByCriteria("Contacts", criteria);
			if (result) {
				return {
					result   : 1,
					contactID: result.data[0].id
				};
			} else {
				crmLogger.info("searchContact() – response from zoho is incorrect");
				return {
					result: 0,
					error : "Response from zoho is incorrect"
				};
			}
		} catch (err) {
			crmLogger.error(`searchContact() – ${err}`);
			return {
				result: 0,
				error : "Unknown error"
			};
		}
	}

	async createContact(data, geoData) {
		try {
			let referrer = "";
			if (data.http_refferer) {
				if (data.http_refferer.length >= 255) {
					referrer = data.http_refferer.substr(0, 254);
				} else {
					referrer = data.http_refferer;
				}
			}

			let country = "";
			if (geoData && geoData.country_name) {
				country = geoData.country_name;
			}

			let city = "";
			if (geoData && geoData.city) {
				city = geoData.city;
			}

			let timezone = "";
			if (geoData && geoData.utc_offset) {
				timezone = "UTC" + geoData.utc_offset;
			}

			const jsonData = {
				"First_Name"   : data.First_Name || "_",
				"Last_Name"    : data.Last_Name || "_",
				"Phone"        : data.Phone.replace(/[\(\)]/g, "").replace(/ /g, "") || "_",
				"Email"        : data.Email || "_",
				"s_lenda"      : true,
				"utm_campaign" : data.utm_campaign || "",
				"utm_medium"   : data.utm_medium || "",
				"utm_source"   : data.utm_source || "",
				"utm_term"     : data.utm_term || "",
				"utm_content"  : data.utm_content || "",
				"http_refferer": referrer,
				"URL"          : data.url || "",
				"Country"      : country,
				"City"         : city,
				"Time_zone"    : timezone
			};

			const result = await ZohoHelpers.createRecord("Contacts", jsonData, "approval, workflow, blueprint");

			if (result) {
				return {
					result   : 1,
					contactID: result.data[0].details.id
				};
			} else {
				crmLogger.info("createContact() – response from zoho is incorrect");
				return {
					result: 0,
					error : "Response from zoho is incorrect"
				};
			}
		} catch (err) {
			crmLogger.error(`createContact() – ${err}`);
			return {
				result: 0,
				error : "Unknown error"
			};
		}
	}
}

Date.prototype.toISOStringTimezoneOffset = function () {
	let tzo = -this.getTimezoneOffset(),
		dif = tzo >= 0 ? "+" : "-",
		pad = function (num) {
			let norm = Math.floor(Math.abs(num));
			return (norm < 10 ? "0" : "") + norm;
		};
	return this.getFullYear() +
		"-" + pad(this.getMonth() + 1) +
		"-" + pad(this.getDate()) +
		"T" + pad(this.getHours()) +
		":" + pad(this.getMinutes()) +
		":" + pad(this.getSeconds()) +
		dif + pad(tzo / 60) +
		":" + pad(tzo % 60);
};

module.exports = new Zoho();
