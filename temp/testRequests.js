const axios = require("axios");

(async () => {
	try {
		const requestResult = await axios({
			method: "get",
			json  : true,
			url   : "https://www.zohoapis.com/crm/v2/coql",
			// headers: { Authorization: "Zoho-oauthtoken 1000.59e77ff1ffb288048f4a7524120f62ba.ed5aaa4b522c508f9edf3a290092e9c6" },
			// data   : {}
		});
		console.log(requestResult.data);
	} catch (err) {
		console.error(err);
	}
})();

/*const request = require("request");
const throttledRequest = require("throttled-request")(request);

throttledRequest.configure({
	requests    : 5,
	milliseconds: 1010
});

(async () => {
	const options = {
		headers: {},
		method : "POST",
		body   : {},
		json   : true,
		url    : "https://www.zohoapis.com/crm/v2/coql"
	};

	throttledRequest(options, (error, response) => {
		if (error) {
			console.error(`ZohoHelpers getDataFromCrm request error: ${error}`);
		} else if (response && response.body) {
			console.log(response.body);
		} else {
			console.log(null);
		}
	});
})();*/
