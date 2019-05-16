const Admin = require("../models/admin").Admin;

new Admin({
	email   : "blood.kh@gmail.com",
	password: "oles1357genius"
}).save((err, admin) => {
	if (err) {
		console.error(err);
	} else {
		console.log("Success!");
	}
});
