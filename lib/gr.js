var axios = require("axios");
var config = require("../config/config");

var apiKey = config.get("getResponse:apiKey");
var apiUrl = config.get("getResponse:apiUrl");
var apiXDomain = config.get("getResponse:X-DOMAIN");

var getResponseLogger = require("../lib/logger").getResponseLogger;

/**
 * Function to add contact to campaign
 * @param {String} [name] - Contact name
 * @param {String} email - Contact email
 * @param {String} campaign - Campaign id that contact to be added to
 * @param {Number} [dayOfCycle] - The day on which the contact is in the Autoresponder cycle. null indicates the contacts is not in the cycle
 * @param {String} [ipAddress] - The contact's IP address. IPv4 and IPv6 formats are accepted
 * @param {Array} [customFieldValues] - Custom fields for contact to send in GR
 * @param {Number} [scoring] - Contact scoring, pass null to remove the score from a contact
 * @param {Array} [tags] - Contact tags
 */
function addToCampaign (name, email, campaign, dayOfCycle, ipAddress, customFieldValues, scoring, tags) {
	var body = {
		campaign: {
			campaignId: campaign
		},
		email
	};

	if (typeof name === "string" && name !== "") {
		body.name = name;
	}

	if (typeof dayOfCycle === "number" && dayOfCycle >= 0) {
		body.dayOfCycle = dayOfCycle;
	}

	if (typeof ipAddress === "string" && ipAddress !== "") {
		body.ipAddress = ipAddress;
	}

	if (customFieldValues && customFieldValues.length > 0) {
		body.customFieldValues = customFieldValues;
	}

	if (typeof scoring === "number" && scoring >= 0) {
		body.scoring = scoring;
	}

	if (tags && tags.length > 0) {
		body.tags = tags;
	}

	var axiosConfig = {
		headers: {
			"Content-Type": "application/json",
			"X-Auth-Token": "api-key " + apiKey,
			"X-Domain": apiXDomain
		}
	};

	axios.post(apiUrl + "/contacts", body, axiosConfig).then(function (r) {
		getResponseLogger.info("[" + new Date() + "] " + email + ", " + campaign + ": contact added to campaign");
	}).catch(function (r) {
		if (r && r.response && r.response.data) {
			getResponseLogger.error("[" + new Date() + "] " + email + ", " + campaign + ": " + JSON.stringify(r.response.data, null, 2));
		} else {
			getResponseLogger.error("[" + new Date() + "] " + email + ", " + campaign + ": Unknown error, " + r);
		}
	});
}

/**
 * Function to get contacts from campaign
 * @param {String} email - Contact email
 * @param {String} campaign - Campaign id
 * @param {function} callback
 */
function getContactByEmail (email, campaign, callback) {
	if (typeof email === "string" && email !== "") {
		if (typeof campaign === "string" && campaign !== "") {
			var emailParsed = email.toString().trim().toLowerCase();

			var axiosConfig = {
				headers: {
					"Content-Type": "application/json",
					"X-Auth-Token": "api-key " + apiKey,
					"X-Domain": apiXDomain
				},
				params: {
					"query[email]": emailParsed,
					fields: "email",
					perPage: 1
				}
			};

			axios.get(apiUrl + "/campaigns/" + campaign + "/contacts", axiosConfig).then(function (r) {
				getResponseLogger.info("[" + new Date() + "] " + campaign + ": received contacts - " + ((r && r.data) ? r.data.length : "null"));
				if (r && r.data) {
					if (r.data && r.data.length > 0) {
						if (r.data[0].email === emailParsed) {
							callback({ result: 1, contact: r.data[0] });
						} else {
							callback({ result: 0, error: "Not found" });
						}
					} else {
						callback({ result: 0, error: "Not found" });
					}
				} else {
					callback({ result: 0, error: "Not found" });
				}
			}).catch(function (r) {
				if (r && r.response && r.response.data) {
					getResponseLogger.error("[" + new Date() + "] " + campaign + ": " + JSON.stringify(r.response.data, null, 2));
				} else {
					getResponseLogger.error("[" + new Date() + "] " + campaign + ": Unknown error, " + r);
				}
				callback({ result: 0, error: "Unknown error" });
			});
		} else {
			callback({ result: 0, error: "campaign should be a string" });
		}
	} else {
		callback({ result: 0, error: "email should be a string" });
	}
}

/**
 * Function to remove contact from GR campaign
 * @param {String} contactId - id of contact to be removed
 */
function deleteContact (contactId) {
	var axiosConfig = {
		headers: {
			"Content-Type": "application/json",
			"X-Auth-Token": "api-key " + apiKey,
			"X-Domain": apiXDomain
		}
	};

	axios.delete(apiUrl + "/contacts/" + contactId, axiosConfig).then(function (r) {
		getResponseLogger.info("[" + new Date() + "] Contact " + contactId + " removed");
	}).catch(function (r) {
		if (r && r.response && r.response.data) {
			getResponseLogger.error("[" + new Date() + "]: " + JSON.stringify(r.response.data, null, 2));
		} else {
			getResponseLogger.error("[" + new Date() + "]: Unknown error, " + r);
		}
	});
}

/**
 * Function to delete contact from campaign
 * @param {String} email - Contact email
 * @param {String} campaign - Campaign id
 */
function deleteContactFromCampaign (email, campaign) {
	getContactByEmail(email, campaign, function (data) {
		if (data.result) {
			deleteContact(data.contactId);
		} else {
			getResponseLogger.error("Error: " + data.error);
		}
	});
}

exports.addToCampaign = addToCampaign;
exports.getContactByEmail = getContactByEmail;
exports.deleteContact = deleteContact;
exports.deleteContactFromCampaign = deleteContactFromCampaign;
