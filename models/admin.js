const mongoose = require("../lib/mongoose");
const autoIncrement = require("../lib/mongoose").autoIncrement;

const Schema = mongoose.Schema;

const bcrypt = require("bcrypt-nodejs");

const adminSchema = new Schema({
	admin_id: { type: Number, unique: true },
	email   : {
		type     : String,
		unique   : true,
		required : true,
		lowercase: true,
		trim     : true,
		match    : /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,7}(?:\.[a-z]{2})?)$/i
	},

	password : { type: String, trim: true },
	created: { type: Date, default: Date.now() }
});

adminSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
adminSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

adminSchema.pre("save", function (next) {
	if (this.isModified("password")) {
		this.password = this.generateHash(this.password);
	}

	next();
});

adminSchema.plugin(autoIncrement.plugin, {
	model      : "Admin",
	field      : "admin_id",
	startAt    : 1,
	incrementBy: 1
});

exports.Admin = mongoose.model("Admin", adminSchema);