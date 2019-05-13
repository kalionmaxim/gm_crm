const Admin = require("../models/admin").Admin;

new Admin({
	email   : "admin@email.com",
	password: "q1w2e3r4t5"
}).save((err, admin) => {
	if (err) {
		console.error(err);
	} else {
		console.log("Success!");
	}
});
