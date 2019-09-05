const zoho = require("../lib/zohoCRM");

zoho.searchContactOrAddNew({ Email: "velikova.smm@gmail.com", Phone: "+79831016663" })
	.then(result => {
		console.log(result);
	});
