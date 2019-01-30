const mongoose = require("../lib/mongoose");
const autoIncrement = require("../lib/mongoose").autoIncrement;

const Schema = mongoose.Schema;

const integrationSchema = new Schema({
	integration_id  : { type: Number, unique: true },
	name            : { type: String },
	productName     : { type: String },
	productID       : { type: String },
	getResponseToken: { type: String }
});

integrationSchema.plugin(autoIncrement.plugin, {
	model      : "Integration",
	field      : "integration_id",
	startAt    : 1,
	incrementBy: 1
});

exports.Integration = mongoose.model("Integration", integrationSchema);
