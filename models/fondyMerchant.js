const mongoose = require("../lib/mongoose");
const autoIncrement = require("../lib/mongoose").autoIncrement;

const Schema = mongoose.Schema;

const fondyMerchantsSchema = new Schema({
	fondy_merchant_id: { type: Number, unique: true },
	ID               : { type: String },
	password         : { type: String },
	lastOrderID      : { type: Number, default: 1 }
});

fondyMerchantsSchema.plugin(autoIncrement.plugin, {
	model      : "FondyMerchant",
	field      : "fondy_merchant_id",
	startAt    : 1,
	incrementBy: 1
});

exports.FondyMerchant = mongoose.model("FondyMerchant", fondyMerchantsSchema);
