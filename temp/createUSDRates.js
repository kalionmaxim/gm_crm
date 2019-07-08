const USDRate = require("../models/usdRate").USDRate;
const async = require("async");

const rates = [{
	price   : 25.83,
	currency: "UAH"
}, {
	price   : 0.89,
	currency: "EUR"
}, {
	price   : 63.59,
	currency: "RUB"
}];

async.eachSeries(rates, (rate, cb) => {
	(new USDRate(rate)).save((err) => {
		cb(err);
	});
}, (err) => {
	if (err) {
		console.error(err);
	} else {
		console.log("Complete!");
	}
});
