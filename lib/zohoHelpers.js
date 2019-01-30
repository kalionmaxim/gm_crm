const config = require("../config/config");
const request = require("request");
const throttledRequest = require("throttled-request")(request);

throttledRequest.configure({
	requests    : 1,
	milliseconds: 1000
});

const authtoken = config.get("ZohoCRM:authtoken");
const eLogger = require("../lib/logger").eLogger;
const crmLogger = require("../lib/logger").crmLogger;

class ZohoService {
	async getDataFromCrm(url, params, method) {
		try {
			const options = {
				headers: {
					"Authorization": authtoken
				},
				method : method,
				body   : ((method === "POST") || (method === "PUT")) ? params : {},
				json   : true,
				url    : url
			};

			return new Promise(resolve => {
				throttledRequest(options, (error, response) => {
					crmLogger.info(method, url, ", getDataFromCrm(): ", JSON.stringify(response.body));

					if (error) {
						eLogger.error(error);
						resolve(null);
					} else if (response) {
						resolve(response.body);
					} else {
						resolve(null);
					}
				});
			});
		} catch (err) {
			crmLogger.error(method, url, ", getDataFromCrm(): ", JSON.stringify(err));

			eLogger.error(new Error(err));
			return null;
		}
	}

	async searchByCriteria(moduleName, criteria) {
		try {
			const url = "https://www.zohoapis.com/crm/v2/" + moduleName + "/search?criteria=" + criteria;
			const result = await this.getDataFromCrm(url, {}, "GET");

			if (result) {
				const jsonArray = result;
				if (jsonArray["status"] === "error") {
					eLogger.error(JSON.stringify(result));
				} else {
					return jsonArray;
				}
			}

			return null;
		} catch (err) {
			eLogger.error(new Error(err));
			return null;
		}
	}

	async createRecord(moduleName, jsonData, wfTriger) {
		try {
			const url = "https://www.zohoapis.com/crm/v2/" + moduleName;
			const trigger = wfTriger ? '"trigger": [' + wfTriger + ']' : '';
			const data = {
				"data"   : [jsonData],
				"trigger": trigger
			};

			const result = await this.getDataFromCrm(url, data, "POST");

			if (result) {
				const jsonArray = result;
				if (jsonArray["status"] === "error") {
					eLogger.error(new Error(JSON.stringify(result)));
				} else {
					return jsonArray;
				}
			}

			return null;
		} catch (err) {
			eLogger.error(new Error(err));
			return null;
		}
	}

	async getDeals(contactID) {
		try {
			const url = "https://www.zohoapis.com/crm/v2/Contacts/" + contactID + "/Deals";
			const result = await this.getDataFromCrm(url, {}, "GET");

			if (result) {
				const jsonArray = result;
				if (jsonArray["status"] === "error") {
					eLogger.error(new Error(JSON.stringify(result)));
				} else {
					return jsonArray;
				}
			}

			return null;
		} catch (err) {
			eLogger.error(new Error(err));
			return null;
		}
	}

	async getRecord(moduleName, id) {
		try {
			const url = "https://www.zohoapis.com/crm/v2/" + moduleName + "/" + id;
			const result = await this.getDataFromCrm(url, {}, "GET");

			if (result) {
				const jsonArray = result;
				if (jsonArray["status"] === "error") {
					eLogger.error(new Error(JSON.stringify(result)));
				} else {
					return jsonArray;
				}
			}

			return null;
		} catch (err) {
			eLogger.error(new Error(err));
			return null;
		}
	}

	async updateFieldValue(moduleName, id, valueApiName, value) {
		try {
			const url = "https://www.zohoapis.com/crm/v2/" + moduleName + "/" + id;
			const data = "{\"data\":[{" + valueApiName + ":" + value + "}]}";

			const result = await this.getDataFromCrm(url, data, "PUT");
			if (result) {
				return result;
			}

			return null;
		} catch (err) {
			eLogger.error(new Error(err));
			return null;
		}
	}

	async updateRecord(moduleName, id, jsonData, wfTriger) {
		try {
			const url = "https://www.zohoapis.com/crm/v2/" + moduleName + "/" + id;
			const trigger = wfTriger ? '"trigger": [' + wfTriger + ']' : '';
			const data = {
				"data"   : [jsonData],
				"trigger": trigger
			};

			const result = await this.getDataFromCrm(url, data, "PUT");
			if (result) {
				const jsonArray = result;
				if (jsonArray["status"] === "error") {
					return null;
				} else {
					return jsonArray;
				}
			}
			return null;
		} catch (err) {
			eLogger.error(new Error(err));
			return null;
		}
	}
}

module.exports = new ZohoService();
