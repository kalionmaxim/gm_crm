const mongoose = require("../lib/mongoose");
const autoIncrement = require("../lib/mongoose").autoIncrement;

const Schema = mongoose.Schema;

const pageSchema = new Schema({
	page_id    : { type: Number, unique: true },
	name       : { type: String },
	description: { type: String },
	price      : { type: Number },
	gr1        : { type: String },
	gr2        : { type: String },
	crm1       : { type: String },
	crm2       : { type: String },
	parts      : [{ type: Number }]
});

pageSchema.plugin(autoIncrement.plugin, {
	model      : "Page",
	field      : "page_id",
	startAt    : 1,
	incrementBy: 1
});

exports.Page = mongoose.model("Page", pageSchema);
