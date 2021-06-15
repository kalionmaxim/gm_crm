const Monobank = require("../lib/monobank");

// Monobank.validateClient("+380000000001")
// Monobank.validateClient("+380938412212")
// Monobank.isOrderPaid("a0eebc99-9c0b-4ef8-bb6d-000000000002")
// Monobank.confirmDelivery("1")
// Monobank.rejectOrder("a0eebc99-9c0b-4ef8-bb6d-000000000002")
// Monobank.stateOrder("a0eebc99-9c0b-4ef8-bb6d-000000000002")
// Monobank.validateClient("+380938412212")
// 	.then((result) => {
// 		console.log("result", result);
// 	});

/*const data = {
	orderID             : "a0eebc99-9c0b-4ef8-bb6d-000000000002",
	return_money_to_card: true,
	sum                 : 1000.00
};

Monobank.returnOrder(data)
	.then((result) => {
		console.log("result", result);
	});*/

/*
const data = {
	client_phone      : "+380938412212",
	total_sum         : 1000.00,
	invoice           : {
		date  : "2019-05-07",
		number: "1",
		source: "INTERNET"
	},
	available_programs: [{
		available_parts_count: [3, 5, 7],
		type                 : "payment_installments"
	}],
	products          : [{
		name : "Test",
		count: 1,
		sum  : 1000.00
	}]
};

Monobank.createOrder(data)
	.then((result) => {
		console.log("result", result);
	});*/

async function main() {
	// uah 980
	// rub 643
	// eur 978
	// usd 840
	const currencyPair = await Monobank.getCurrencyInfo(978, 980);
	console.log(currencyPair);
}

main().then(() => { console.log("Done"); });
