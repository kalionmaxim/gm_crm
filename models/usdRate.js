const mongoose = require("../lib/mongoose");
const autoIncrement = require("../lib/mongoose").autoIncrement;

const Schema = mongoose.Schema;

const usdRateSchema = new Schema({
	usd_rate_id: { type: Number, unique: true },
	price      : { type: Number },
	currency   : { type: String }
});

usdRateSchema.plugin(autoIncrement.plugin, {
	model      : "USDRate",
	field      : "usd_rate_id",
	startAt    : 1,
	incrementBy: 1
});

exports.USDRate = mongoose.model("USDRate", usdRateSchema);
