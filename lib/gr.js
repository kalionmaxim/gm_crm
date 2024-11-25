var axios = require("axios");
var config = require("../config/config");

var apiKey = config.get("getResponse:apiKey");
var apiUrl = config.get("getResponse:apiUrl");
var apiXDomain = config.get("getResponse:X-DOMAIN");
var grPhoneFieldId = config.get("getResponse:customFieldsIds:custom_phone");

var getResponseLogger = require("../lib/logger").getResponseLogger;

const axiosHeaders = {
  "Content-Type": "application/json",
  "X-Auth-Token": "api-key " + apiKey,
  "X-Domain": apiXDomain,
};

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
function addToCampaign(
  name,
  email,
  campaign,
  dayOfCycle,
  ipAddress,
  customFieldValues,
  scoring,
  tags
) {
  var body = {
    campaign: {
      campaignId: campaign,
    },
    email,
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
    var customFieldsParsed = [];
    for (var i = 0; i < customFieldValues.length; i++) {
      if (customFieldValues[i].phone && customFieldValues[i].phone !== "") {
        customFieldsParsed.push({
          customFieldId: grPhoneFieldId,
          value: [customFieldValues[i].phone],
        });
      }
    }

    if (customFieldsParsed.length > 0) {
      body.customFieldValues = customFieldsParsed;
    }
  }

  if (typeof scoring === "number" && scoring >= 0) {
    body.scoring = scoring;
  }

  if (tags && tags.length > 0) {
    body.tags = tags;
  }

  var axiosConfig = {
    headers: axiosHeaders,
  };

  axios
    .post(apiUrl + "/contacts", body, axiosConfig)
    .then(function (r) {
      getResponseLogger.info(
        "[" +
          new Date() +
          "] " +
          email +
          ", " +
          campaign +
          ": contact added to campaign"
      );
    })
    .catch(function (r) {
      if (r && r.response && r.response.data) {
        getResponseLogger.error(
          "[" +
            new Date() +
            "] " +
            email +
            ", " +
            campaign +
            ": " +
            JSON.stringify(r.response.data, null, 2)
        );
      } else {
        getResponseLogger.error(
          "[" +
            new Date() +
            "] " +
            email +
            ", " +
            campaign +
            ": Unknown error, " +
            r
        );
      }
    });
}

/**
 * Function to get contacts from campaign
 * @param {String} email - Contact email
 * @param {String} campaign - Campaign id
 * @param {function} callback
 */
function getContactByEmail(email, campaign, callback) {
  if (typeof email === "string" && email !== "") {
    if (typeof campaign === "string" && campaign !== "") {
      var emailParsed = email.toString().trim().toLowerCase();

      var axiosConfig = {
        headers: axiosHeaders,
        params: {
          "query[email]": emailParsed,
          fields: "email",
          perPage: 1,
        },
      };

      axios
        .get(apiUrl + "/campaigns/" + campaign + "/contacts", axiosConfig)
        .then(function (r) {
          getResponseLogger.info(
            "[" +
              new Date() +
              "] " +
              campaign +
              ": received contacts - " +
              (r && r.data ? r.data.length : "null")
          );
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
        })
        .catch(function (r) {
          if (r && r.response && r.response.data) {
            getResponseLogger.error(
              "[" +
                new Date() +
                "] " +
                campaign +
                ": " +
                JSON.stringify(r.response.data, null, 2)
            );
          } else {
            getResponseLogger.error(
              "[" + new Date() + "] " + campaign + ": Unknown error, " + r
            );
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

function getListOfCustomFields(name, callback) {
  if (typeof name === "string" && name !== "") {
    var nameParsed = name.toString().trim().toLowerCase();

    var axiosConfig = {
      headers: axiosHeaders,
      params: {
        "query[name]": nameParsed,
        perPage: 10,
      },
    };

    axios
      .get(apiUrl + "/custom-fields", axiosConfig)
      .then(function (r) {
        getResponseLogger.info(
          "[" +
            new Date() +
            "]: received custom fields - " +
            (r && r.data ? r.data.length : "null")
        );
        if (r && r.data) {
          if (r.data && r.data.length > 0) {
            callback({ result: 1, customFields: r.data });
          } else {
            callback({ result: 0, error: "Not found" });
          }
        } else {
          callback({ result: 0, error: "Not found" });
        }
      })
      .catch(function (r) {
        if (r && r.response && r.response.data) {
          getResponseLogger.error(
            "[" + new Date() + "]: " + JSON.stringify(r.response.data, null, 2)
          );
        } else {
          getResponseLogger.error("[" + new Date() + "]: Unknown error, " + r);
        }
        callback({ result: 0, error: "Unknown error" });
      });
  } else {
    callback({ result: 0, error: "name is empty or not defined" });
  }
}

/**
 * Function to remove contact from GR campaign
 * @param {String} contactId - id of contact to be removed
 */
function deleteContact(contactId) {
  var axiosConfig = {
    headers: axiosHeaders,
  };

  axios
    .delete(apiUrl + "/contacts/" + contactId, axiosConfig)
    .then(function (r) {
      getResponseLogger.info(
        "[" + new Date() + "] Contact " + contactId + " removed"
      );
    })
    .catch(function (r) {
      if (r && r.response && r.response.data) {
        getResponseLogger.error(
          "[" + new Date() + "]: " + JSON.stringify(r.response.data, null, 2)
        );
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
function deleteContactFromCampaign(email, campaign) {
  getContactByEmail(email, campaign, function (data) {
    if (data.result) {
      if (data.contact && data.contact.contactId) {
        deleteContact(data.contact.contactId);
      } else {
        getResponseLogger.error("Error: contact is empty or undefined");
      }
    } else {
      getResponseLogger.error("Error: " + data.error);
    }
  });
}

async function fetchFromFields() {
  try {
    const response = await axios.get(`${apiUrl}/from-fields`, {
      headers: axiosHeaders,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching from-fields:", error);
    throw error;
  }
}

async function sendTransactionalEmail(subject, content, toEmail, attachments) {
  try {
    const response = await axios.post(
      `${apiUrl}/transactional-emails`,
      {
        fromField: {
          fromFieldId: "ShGj",
        },
        replyTo: {
          fromFieldId: "ShGj",
        },
        contentType: "direct",
        recipients: {
          to: {
            email: toEmail,
          },
        },
        subject,
        content: {
          html: content,
        },
        attachments,
      },
      {
        headers: axiosHeaders,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error sending transactional email:", error);
    throw error;
  }
}

exports.addToCampaign = addToCampaign;
exports.getContactByEmail = getContactByEmail;
exports.deleteContact = deleteContact;
exports.deleteContactFromCampaign = deleteContactFromCampaign;
exports.getListOfCustomFields = getListOfCustomFields;
exports.fetchFromFields = fetchFromFields;
exports.sendTransactionalEmail = sendTransactionalEmail;
