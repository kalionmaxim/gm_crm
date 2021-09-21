var addToCampaign = require("../lib/gr").addToCampaign;
var getContactByEmail = require("../lib/gr").getContactByEmail;
var deleteContact = require("../lib/gr").deleteContact;
var deleteContactFromCampaign = require("../lib/gr").deleteContactFromCampaign;
var getListOfCustomFields = require("../lib/gr").getListOfCustomFields;

// addToCampaign(null, "gonipeb910@tst999.com", "b7k1", null, null, null, null, null);
// addToCampaign(null, "gonipeb910@tst999.com", "b7k1", null, null, [{phone: "123123123"}], null, null);
// getListOfCustomFields("phone", function (result) {
// 	console.log(result);
// });
// addToCampaign(null, "sumson65@gmail.com", "b7k1", null, null, null, null, null);
// getContactByEmail("gonipeb910@tst999.com", "b7k1", function (result) {
// 	console.log(result);
// });

// deleteContact("JUrCMI");

// deleteContactFromCampaign("sumson65@gmail.com", "b7k1");

// function search (nameKey, myArray){
// 	for (var i = 0; i < myArray.length; i++) {
// 		if (myArray[i].name === nameKey) {
// 			return myArray[i];
// 		}
// 	}
// }
