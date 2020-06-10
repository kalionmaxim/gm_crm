const zoho = require("../lib/zohoCRM");
const ZohoHelpers = require("../lib/zohoHelpers");

/*zoho.searchContact({ Email: "anton.shaiko9@mail.ru", Phone: "+37529" })
	.then(result => {
		console.log(result);
	});*/

/*zoho.searchContactByID("3678676000069968293")
	.then(result => {
		console.log(result);
	});*/

/*
zoho.getPhoneByContactID("3678676000074202523")
	.then(result => {
		console.log(result);
	});
*/

/*
zoho.getDealByContactAndProduct("3678676000068771377", "3678676000069398001")
	.then(result => {
		console.log(result);
	});
*/

/*
ZohoHelpers.getRecord("Sales_Orders", "3678676000083239836")
	.then(result => {
		console.log(result);
	});*/

const data = {
	Email: "kdjsfhsakfasd@agilekz.com"
};
zoho.searchContact(data)
	.then(result => {
		console.log(result);
	});
