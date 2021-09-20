var addToCampaign = require("../lib/gr").addToCampaign;
// var addToCampaign = require("../lib/getResponse").addToCampaign;
var getContactByEmail = require("../lib/gr").getContactByEmail;
var deleteContact = require("../lib/gr").deleteContact;
var deleteContactFromCampaign = require("../lib/gr").deleteContactFromCampaign;

// var removeFromCampaign = require("../lib/getResponse").removeFromCampaign;
//
// removeFromCampaign("sumson65@gmail.com", "b7k1");

// addToCampaign(null, "gonipeb910@tst999.com", "b7k1", null, null, null, null, null);
// addToCampaign(null, "sumson65@gmail.com", "b7k1", null, null, null, null, null);
getContactByEmail("gonipeb910@tst999.com", "b7k1", function (result) {
	console.log(result);
});

// deleteContact("JUrCFK");

// deleteContactFromCampaign("sumson65@gmail.com", "b7k1");

// function search (nameKey, myArray){
// 	for (var i = 0; i < myArray.length; i++) {
// 		if (myArray[i].name === nameKey) {
// 			return myArray[i];
// 		}
// 	}
// }
