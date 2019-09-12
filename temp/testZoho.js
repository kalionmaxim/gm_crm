const zoho = require("../lib/zohoCRM");

zoho.searchContact({ Email: "anton.shaiko9@mail.ru", Phone: "+37529" })
	.then(result => {
		console.log(result);
	});
