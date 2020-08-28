const config = require("../config/config");
const request = require("request");
const throttledRequest = require("throttled-request")(request);

throttledRequest.configure({
	requests    : 5,
	milliseconds: 1010
});

const eLogger = require("../lib/logger").eLogger;
const crmLogger = require("../lib/logger").crmLogger;

const clientID = config.get("ZohoCRM:client_id");
const clientSecret = config.get("ZohoCRM:client_secret");
const refreshToken = config.get("ZohoCRM:refresh_token");
let accessToken = null;
let accessExpiresDate = null;

class ZohoService {
	async oAuth() {
		try {
			const now = new Date();
			if (accessToken && (accessExpiresDate > now)) {
				return accessToken;
			} else {
				const url = "https://accounts.zoho.com/oauth/v2/token";
				const body = {
					client_id    : clientID,
					client_secret: clientSecret,
					grant_type   : "refresh_token",
					refresh_token: refreshToken
				};

				const options = {
					method: "POST",
					form  : body,
					url   : url
				};

				return new Promise(resolve => {
					throttledRequest(options, function (error, response) {
						if (error) {
							eLogger.error(error);
						}

						crmLogger.info("POST", url, ", oauth(): ", JSON.stringify(response.body));
						const body = JSON.parse(response.body) || null;

						if (body && body.access_token && body.expires_in_sec) {
							accessToken = body.access_token;
							accessExpiresDate = new Date();
							accessExpiresDate.setSeconds(accessExpiresDate.getSeconds() + parseInt(body.expires_in_sec, 10) - 100);
							resolve(accessToken);
						} else {
							resolve(null);
						}
					});
				});
			}
		} catch (err) {
			eLogger.error(err);
			return null;
		}
	}

	async getDataFromCrm(url, params, method) {
		try {
			const oAuthData = await this.oAuth();

			if (oAuthData) {
				const options = {
					headers: {
						"Authorization": "Zoho-oauthtoken " + oAuthData
					},
					method : method,
					body   : ((method === "POST") || (method === "PUT")) ? params : {},
					json   : true,
					url    : url
				};

				return new Promise(resolve => {
					throttledRequest(options, (error, response) => {
						if (error) {
							eLogger.error(error);
							resolve(null);
						} else if (response && response.body) {
							crmLogger.info(method, url, ", getDataFromCrm() params: ", (params || {}), ", getDataFromCrm() response: ", JSON.stringify(response.body));

							resolve(response.body);
						} else {
							resolve(null);
						}
					});
				});
			} else {
				crmLogger.error(method, url, ", getDataFromCrm(): Token not found");
				return null;
			}
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

	async searchByCriteriaCOQL(criteria) {
		try {
			const url = "https://www.zohoapis.com/crm/v2/coql";
			const result = await this.getDataFromCrm(url, criteria, "POST");

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
					eLogger.error(url, new Error(JSON.stringify(result)));
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
