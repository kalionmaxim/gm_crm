const Admin = require("../models/admin").Admin;

async function createAdmin() {
	try {
		const admin = await Admin.findOne({ email: "manukianartur1997@gmail.com" });

		if (admin) {
			admin.password = "kUXyL3FCCbHk";

			await admin.save();
		} else {
			await Admin.create({
				email: "manukianartur1997@gmail.com",
				password: "kUXyL3FCCbHk"
			});
		}
	} catch (err) {
		console.error(err);
	}
}

createAdmin().then(() => {
	console.log("Complete");
});
