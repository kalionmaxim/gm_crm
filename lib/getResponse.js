/**
 * Created by Grigoriy on 05.10.2016.
 */

const config = require("../config/config");

const apiKey = config.get("getResponse:apiKey");
const apiUrl = config.get("getResponse:apiUrl");
const api = new require("../lib/getResponseLib")(apiKey, apiUrl);
const getResponseLogger = require("../lib/logger").getResponseLogger;

const addToCampaign = function (name, email, campaign, cycleDay, ip, customFields) {
	api.addContact(campaign, name, email, null, cycleDay, ip, customFields, function (r) {
		getResponseLogger.info("[" + new Date() + "] " + email + ", " + campaign + ": " + JSON.stringify(r));
	});
};

const removeFromCampaign = function (email, campaign) {
	campaign = [campaign];
	api.getContactsByEmail(email, campaign, null, function (r) {
		const keys = [];
		if (r.data) {
			for (const k in r.data.result) {
				keys.push(k);
			}
		}
		const key = keys[0];

		if (key) {
			api.deleteContact(key, function (r) {
				getResponseLogger.info("[" + new Date() + "] " + email + ", " + campaign + ": " + JSON.stringify(r));
			});
		}
	});
};

exports.addToCampaign = addToCampaign;
exports.removeFromCampaign = removeFromCampaign;
