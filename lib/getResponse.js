/**
 * Created by Grigoriy on 05.10.2016.
 */

var config = require("../config/config");

var apiKey = config.get("getResponse:apiKey");
var apiUrl = config.get("getResponse:apiUrl");
var api = new require("../lib/getResponseLib")(apiKey, apiUrl);
var getResponseLogger = require("../lib/logger").getResponseLogger;

var addToCampaign = function (name, email, campaign, cycleDay, ip, customFields) {
	api.addContact(campaign, name, email, null, cycleDay, ip, customFields, function (r) {
		getResponseLogger.info("[" + new Date() + "] " + email + ", " + campaign + ": " + JSON.stringify(r));
	});
};

var removeFromCampaign = function (email, campaign) {
	campaign = [campaign];
	api.getContactsByEmail(email, campaign, null, function (r) {
		var keys = [];
		if (r.data) {
			for (var k in r.data.result) {
				keys.push(k);
			}
		}
		var key = keys[0];

		if (key) {
			api.deleteContact(key, function (r) {
				getResponseLogger.info("[" + new Date() + "] " + email + ", " + campaign + ": " + JSON.stringify(r));
			});
		}
	});
};

exports.addToCampaign = addToCampaign;
exports.removeFromCampaign = removeFromCampaign;
