const Admin = require("../models/admin").Admin;

async function createAdmin() {
	try {
		const admin = await Admin.findOne({ email: "blood.kh@gmail.com" });

		if (admin) {
			admin.password = "c5Ci6DQz01W%5NNP";

			await admin.save();
		} else {
			await Admin.create({
				email: "blood.kh@gmail.com",
				password: "c5Ci6DQz01W%5NNP"
			});
		}
	} catch (err) {
		console.error(err);
	}
}

createAdmin().then(() => {
	console.log("Complete");
});
