const AuthLocalStrategy = require("passport-local").Strategy;

const Admin = require("../models/admin").Admin;

module.exports = function (passport) {
	passport.serializeUser(function (admin, done) {
		done(null, { id: admin.id });
	});

	passport.deserializeUser(function (data, done) {
		Admin.findById(data.id)
			.exec(function (err, admin) {
				if (admin) {
					const adminAssigned = Object.assign({}, admin._doc);
					done(err, adminAssigned);
				} else {
					done(err, admin);
				}
			});

	});

	passport.use("local", new AuthLocalStrategy(
		{
			usernameField: "email",
			passwordField: "password"
		}, function (email, password, done) {
			Admin.findOne({ email: email.toLowerCase().trim() }, (err, admin) => {
				if (err) {
					return done(err);
				}

				if (!admin) {
					return done(null, false, { message: "User not found" });
				}

				if (!admin.validPassword(password)) {
					return done(null, false, { message: "Incorrect login/password" });
				}

				return done(null, admin);
			});
		}
	));
};
