const crmLogger = require("./logger").crmLogger;

const ZohoHelpers = require("./zohoHelpers");

class Zoho {
	async createVisit(data, geoData) {
		try {
			crmLogger.info("createVisit() body", JSON.stringify(data, null, 2));

			let contactID = null;
			let dealID = data.dealID || null;

			if (data.contactID) {
				const contactByID = await this.searchContactByID(data.contactID);
				if (contactByID && contactByID.result && contactByID.contactID) {
					contactID = data.contactID;
				} else {
					contactID = (await this.searchContactOrAddNew(data, geoData)).contactID || null;
					data.contactID = contactID;
				}
			} else {
				contactID = (await this.searchContactOrAddNew(data, geoData)).contactID || null;
				data.contactID = contactID;
			}

			if (!dealID) {
				data.Product_type = "Лид-магнит";
				dealID = (await this.createDeal(data, geoData)).dealID || null;
			}

			if (contactID && dealID) {
				let referrer = "";
				if (data.http_refferer) {
					if (data.http_refferer.length >= 255) {
						referrer = data.http_refferer.substr(0, 254);
					} else {
						referrer = data.http_refferer;
					}
				}

				let visitName = "";
				if (data.First_Name) {
					if (visitName.length > 0) {
						visitName += " ";
					}
					visitName += data.First_Name;
				}

				if (data.Last_Name) {
					if (visitName.length > 0) {
						visitName += " ";
					}
					visitName += data.Last_Name;
				}

				if (data.Event_Name) {
					if (visitName.length > 0) {
						visitName += " ";
					}

					visitName += data.Event_Name;
				}

				const jsonData = {
					"Contact"      : { "id": contactID },
					"Deal"         : { "id": dealID },
					"Name"         : visitName,
					"Email"        : data.Email,
					"Phone"        : data.Phone || "",
					"Product"      : decodeURIComponent(data.productID),
					"utm_campaign" : data.utm_campaign || "",
					"utm_content"  : data.utm_content || "",
					"utm_medium"   : data.utm_medium || "",
					"utm_source"   : data.utm_source || "",
					"utm_term"     : data.utm_term || "",
					"http_refferer": referrer

				};

				const result = await ZohoHelpers.createRecord("mk_Visits", jsonData, "approval, workflow, blueprint");

				if (result) {
					return {
						result : 1,
						visitID: (result.data[0].details.id).toString(),
						dealID,
						contactID
					};
				} else {
					crmLogger.info("createVisit() – response from zoho is incorrect");
					return {
						result: 0,
						error : "Response from zoho is incorrect"
					};
				}
			} else {
				return {
					result: 0,
					error : "contactID/potentialID – unknown"
				};
			}
		} catch (err) {
			crmLogger.error(`createVisit() – ${err}`);
			return {
				result: 0,
				error : "Unknown error while creating visit"
			};
		}
	}

	async createPayment(data) {
		try {
			// const salesOrder = await ZohoHelpers.getRecord("Sales_Orders", data.invoice);

			const date = new Date().toISOStringTimezoneOffset();

			const jsonData = {
				"Name"         : "Платеж – " + data.invoice + " - " + date,
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
					paymentID: (result.data[0].details.id).toString()
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

	async createPaymentV2(data) {
		try {
			const date = new Date().toISOStringTimezoneOffset();

			const jsonData = {
				"Name"         : "Платеж – " + data.invoice + " - " + date,
				"invoice"      : data.invoice,
				"oplata_time"  : date,
				"sposob_oplaty": data.sposob_oplaty,
				"total_sum"    : data.total_sum,
				"autooplata"   : data.autooplata,
				"Status"       : data.status,
				"Currency"     : data.currency.toUpperCase()
			};

			const result = await ZohoHelpers.createRecord("Payments", jsonData, "approval, workflow, blueprint");

			if (result) {
				return {
					result   : 1,
					paymentID: (result.data[0].details.id).toString()
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

	async createPaymentV3(data) {
		try {
			const date = new Date().toISOStringTimezoneOffset();

			const jsonData = {
				"Name"          : "Платеж – " + data.invoice + " - " + date,
				"invoice"       : data.invoice,
				"oplata_time"   : date,
				"sposob_oplaty" : data.sposob_oplaty,
				"total_sum"     : data.total_sum,
				"autooplata"    : true,
				"Status"        : "Оплачен",
				"Currency"      : data.Currency.toUpperCase(),
				"numberMonobank": data.numberMonobank + "",
				"comm_sum"      : data.commisionSum,
				"sum_ZP"        : data.salarySum
			};

			const result = await ZohoHelpers.createRecord("Payments", jsonData, "approval, workflow, blueprint");

			if (result) {
				return {
					result   : 1,
					paymentID: (result.data[0].details.id).toString()
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
			crmLogger.info("createSalesOrder() body", JSON.stringify(data, null, 2));

			let contactID = null;
			let dealID = null;
			if (data.contactID) {
				const contactByID = await this.searchContactByID(data.contactID);
				if (contactByID && contactByID.result && contactByID.contactID) {
					contactID = data.contactID;
				} else {
					contactID = (await this.searchContactOrAddNew(data, geoData)).contactID || null;
					data.contactID = contactID;
				}
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
					"Subject"        : "Счет - " + data.productName.replace(/\n/gi, "") + " – " + data.First_Name,
					"Status"         : data.Status ? data.Status : "Новый",
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
					}],

					"Payment_Sys": data.Payment_Sys,
					"type_rassrochka": data.type_rassrochka,
					"count_parts": data.count_parts
				};

				const result = await ZohoHelpers.createRecord("Sales_Orders", jsonData, "approval, workflow, blueprint");

				if (result) {
					return {
						result      : 1,
						salesOrderID: (result.data[0].details.id).toString(),
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
			crmLogger.info("updateDeal() body", JSON.stringify(data, null, 2));

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
				dealID = (await this.createDeal(data, geoData)).dealID;
			}

			if (dealID) {
				const result = await ZohoHelpers.updateRecord("Deals", dealID, jsonData, "approval, workflow, blueprint");

				if (result) {
					return {
						result: 1,
						dealID: (result.data[0].details.id).toString()
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
			crmLogger.info("searchDeal() body", JSON.stringify(data, null, 2));

			let contactID = null;
			if (data.contactID) {
				const contactByID = await this.searchContactByID(data.contactID);
				if (contactByID && contactByID.result && contactByID.contactID) {
					contactID = data.contactID;
				} else {
					contactID = (await this.searchContactOrAddNew(data, geoData)).contactID || null;
					data.contactID = contactID;
				}
			} else {
				if (!data.Email) {
					return {
						result: 0,
						error : "Field \"Email\" required, but it is undefined"
					};
				} else if (!data.First_Name) {
					return {
						result: 0,
						error : "Field \"First_Name\" required, but it is undefined"
					};
				} else {
					contactID = (await this.searchContactOrAddNew(data, geoData)).contactID;
					data.contactID = contactID;
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
						dealID = (await this.createDeal(data, geoData)).dealID || null;
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
			crmLogger.info("createDeal() body", JSON.stringify(data, null, 2));

			let contactID = null;
			if (data.contactID) {
				const contactByID = await this.searchContactByID(data.contactID);
				if (contactByID && contactByID.result && contactByID.contactID) {
					contactID = data.contactID;
				} else {
					contactID = (await this.searchContactOrAddNew(data, geoData)).contactID || null;
					data.contactID = contactID;
				}
			} else {
				contactID = (await this.searchContactOrAddNew(data, geoData)).contactID || null;
				data.contactID = contactID;
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
				if (!data.Phone && contactID && (data.autocompletePhone && (data.autocompletePhone === "true"))) {
					data.Phone = (await this.getPhoneByContactID(contactID)).phone || null;

					if (data.Phone) {
						data.Stage = "1. Заявка";
					}
				}

				// Проверка существования сделки на указанный продукт в стадии 1. Заявка
				const existDealID = (await this.getDealByContactAndProduct(contactID, data.productID)).dealID || null;

				if (!existDealID) {
					// Создание сделки
					const jsonData = {
						"Deal_Name"    : data.productName.replace(/\n/gi, "") + " – " + data.First_Name,
						"Stage"        : data.Stage || "1. Заявка",
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
						"Currency"     : data.Currency || "USD",
						"Country"      : country,
						"City"         : city,
						"Time_zone"    : timezone,
						"sposob_svyazi": data.sposob_svyazi || "",
						"clientID"     : data.clientID || ""
					};

					if (data.Product_type) {
						jsonData["Product_type"] = data.Product_type;
					}

					const result = await ZohoHelpers.createRecord("Deals", jsonData, "approval, workflow, blueprint");

					if (result) {
						return {
							result: 1,
							dealID: (result.data[0].details.id).toString(),
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
						result: 1,
						dealID: existDealID.toString(),
						contactID
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

	async getDealByContactAndProduct(contactID, productID) {
		try {
			if (contactID && productID) {
				let selectQuery = "select Deal_Name from Deals where (((Contact_Name='" + contactID + "') and (product='" + productID + "')) and (Stage='1. Заявка'))";

				const criteria = { "select_query": selectQuery };

				const result = await ZohoHelpers.searchByCriteriaCOQL(criteria);

				if (result) {
					if (result.data && (result.data.length >= 1)) {
						let dealID = result.data[0].id;
						const updData = { "repeated_deal": true };

						await ZohoHelpers.updateRecord("Deals", dealID, updData, "approval, workflow, blueprint");

						return {
							result: 1,
							dealID
						};
					} else {
						return {
							result: 0
						};
					}
				} else {
					crmLogger.info("getDealByContactAndProduct() – deal not found");
					return {
						result: 0,
						error : "Deal not found"
					};
				}
			} else {
				return {
					result: 0,
					error : "contactID/productID are undefined"
				};
			}
		} catch (err) {
			crmLogger.error(`getDealByContactAndProduct() – ${err}`);
			return {
				result: 0,
				error : "Unknown error while creating deal"
			};
		}
	}

	async getPhoneByContactID(contactID) {
		try {
			if (contactID) {
				const contact = await ZohoHelpers.getRecord("Contacts", contactID);

				if (contact && contact.data && contact.data[0]) {
					let phone = null;
					if (!phone && contact.data[0].Phone && (contact.data[0].Phone !== "_")) {
						phone = contact.data[0].Phone;
					}

					if (!phone && contact.data[0].field9 && (contact.data[0].field9 !== "_")) {
						phone = contact.data[0].field9;
					}

					if (!phone && contact.data[0].field10 && (contact.data[0].field10 !== "_")) {
						phone = contact.data[0].field10;
					}

					if (!phone && contact.data[0].Phone_Syndicate && (contact.data[0].Phone_Syndicate !== "_")) {
						phone = contact.data[0].Phone_Syndicate;
					}

					if (!phone && contact.data[0].Phone_KIM && (contact.data[0].Phone_KIM !== "_")) {
						phone = contact.data[0].Phone_KIM;
					}

					if (!phone && contact.data[0].Phone_expert && (contact.data[0].Phone_expert !== "_")) {
						phone = contact.data[0].Phone_expert;
					}

					return {
						result: 1,
						phone
					};
				} else {
					return {
						result: 0
					};
				}
			} else {
				return {
					result: 0
				};
			}
		} catch (err) {
			crmLogger.error(`getPhoneByContactID() – ${err}`);
			return {
				result: 0,
				error : "Unknown error while searching phone by contactID"
			};
		}
	}

	async updateContact(data) {
		try {
			crmLogger.info("updateContact() body", JSON.stringify(data, null, 2));

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
				crmLogger.info("updateContact() – response from zoho is incorrect");
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
			crmLogger.info("searchContactOrAddNew() body", JSON.stringify(data, null, 2));

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

	async searchContactAndUpdateOrAddNew(data, geoData) {
		try {
			crmLogger.info("searchContactAndUpdateOrAddNew() body", JSON.stringify(data, null, 2));

			let contactID = (await this.searchContact(data)).contactID || null;
			if (contactID) {
				data.contactID = contactID;
				const updateContactResult = await this.updateContact(data);
				if (updateContactResult.result) {
					return {
						result: 1
					};
				} else {
					return {
						result: 0
					};
				}
			} else {
				const createContactResult = await this.createContact(data, geoData);
				if (createContactResult.result) {
					return {
						result: 1
					};
				} else {
					return {
						result: 0
					};
				}
			}
		} catch (err) {
			crmLogger.error(`searchContactAndUpdateOrAddNew() – ${err}`);
			return {
				result: 0,
				error : "Unknown error while searching/updating/creating contact"
			};
		}
	}

	async searchContactByID(id) {
		try {
			if (id) {
				const contact = await ZohoHelpers.getRecord("Contacts", id);

				if (contact && contact.data && contact.data[0]) {
					return {
						result   : 1,
						contactID: contact.data[0].id
					};
				} else {
					return {
						result: 0
					};
				}
			} else {
				return {
					result: 0
				};
			}
		} catch (err) {
			crmLogger.error(`searchContactByID() – ${err}`);
			return {
				result: 0,
				error : "Unknown error while searching contact by ID"
			};
		}
	}

	async searchContact(data) {
		try {
			let selectQuery = "select First_Name, Last_Name, Email, Phone from Contacts where ";
			if (data.Email && data.Phone) {
				selectQuery += "Email='" + data.Email.toLowerCase().trim() + "' or Phone='" + data.Phone.replace(/[\(\)]/g, "").replace(/ /g, "") + "'";
			} else {
				if (data.Email) {
					selectQuery += "Email='" + data.Email.toLowerCase().trim() + "'";
				} else if (data.Phone) {
					selectQuery += "Phone='" + data.Phone.replace(/[\(\)]/g, "").replace(/ /g, "") + "'";
				} else {
					crmLogger.info("searchContact() – email and/or phone are undefined");
					return {
						result: 0,
						error : "Email and phone are undefined. Can't find any record"
					};
				}
			}
			const criteria = { "select_query": selectQuery };

			const result = await ZohoHelpers.searchByCriteriaCOQL(criteria);
			if (result) {
				if (result.data && (result.data.length > 0)) {
					if (result.data.length === 1) {
						return {
							result   : 1,
							contactID: result.data[0].id.toString()
						};
					} else if (result.data.length > 1) {
						let contactID = result.data[0].id.toString();

						if (data.Email) {
							for (let i = 1; i < result.data.length; i++) {
								if (result.data[i].Email.toLowerCase() === data.Email.toLowerCase().trim()) {
									contactID = result.data[i].id;
									break;
								}
							}
						} else if (data.Phone) {
							for (let i = 1; i < result.data.length; i++) {
								if (result.data[i].Phone.toLowerCase() === data.Phone) {
									contactID = result.data[i].id;
									break;
								}
							}
						}

						return {
							result: 1,
							contactID
						};
					}
				} else {
					return {
						result: 0
					};
				}
			} else {
				crmLogger.info("searchContact() – contact not found");
				return {
					result: 0,
					error : "Contact not found"
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
			crmLogger.info("createContact() body", JSON.stringify(data, null, 2));

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

			let phone = data.Phone || "";

			const jsonData = {
				"First_Name"   : data.First_Name || "_",
				"Last_Name"    : data.Last_Name || "_",
				"Phone"        : phone.replace(/[\(\)]/g, "").replace(/ /g, "") || "",
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
				"field5"       : timezone,

				"academy_course"        : data.academy_course,
				"academy_communication" : data.academy_communication,
				"academy_meeting"       : data.academy_meeting,

				"corp_training"       : data.corp_training,
				"training_directions" : data.training_directions,

				"clientID" : data.clientID || ""
			};

			const result = await ZohoHelpers.createRecord("Contacts", jsonData, "approval, workflow, blueprint");

			if (result) {
				return {
					result   : 1,
					contactID: (result.data[0].details.id).toString()
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
