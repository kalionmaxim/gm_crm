const Curl = require("node-libcurl").Curl;
const querystring = require("querystring");
const moment = require("moment");
const eLogger = require("../lib/logger").eLogger;

function addDealToCrm(firstName, email, phone, companyID) {
	const curl = new Curl();
	// var url = "http://dev.gmlab.me/test/getData.php";
	const url = "http://crm.geniusm.me/api/deals/add_deal";
	const currentDateTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

	if (!phone) {
		phone = "";
	}

	let data = {
		"data[manager_id]" : "0",
		"data[category_id]": companyID.toString(),
		"data[time]"       : currentDateTime,
		"name"             : firstName.toString(),
		"email"            : email.toString(),
		"phone"            : phone.toString()
	};

	data = querystring.stringify(data);

	curl.setOpt("URL", url);
	curl.setOpt("FOLLOWLOCATION", true);
	curl.setOpt(Curl.option.CONNECTTIMEOUT, 10);
	curl.setOpt(Curl.option.TIMEOUT, 10);
	curl.setOpt(Curl.option.POSTFIELDS, data);

	curl.on("end", function (statusCode, body, headers) {
		//res.send({result: 1});
		console.log("\x1b[44m\x1b[30m" + "statusCode: " + statusCode + "\x1b[0m");
		console.log(headers);
		console.log(body);
		this.close();
	});

	curl.on("error", function (err, curlErrorCode) {
		console.log("\x1b[44m\x1b[30m" + "error export to CRM" + "\x1b[0m");
		eLogger.error("Error! Request to CRM was not sent! Error: " + err.message + " | " + curlErrorCode);
		console.log("\x1b[44m\x1b[30m" + "err: " + err + "curlErrorCode" + curlErrorCode + "\x1b[0m");

		//res.send({result: 0});
		this.close();
	});

	curl.perform();
}

exports.addDealToCrm = addDealToCrm;
