const mongoose = require("../lib/mongoose");
const autoIncrement = require("../lib/mongoose").autoIncrement;

const statuses = ["processing", "failed", "success"];

const Schema = mongoose.Schema;

const plataOrderSchema = new Schema({
	salesOrderID: { type: String, required: true },
	invoiceId: { type: String },
	status: { type: String, enum: statuses, default: statuses[0] },

	email: { type: String, required: true },
	productName: { type: String },
	productPrice: { type: Number },
	currency: { type: String },
});

plataOrderSchema.plugin(autoIncrement.plugin, {
	model: "PlataOrder",
	field: "plata_order_id",
	startAt: 1,
	incrementBy: 1,
});

exports.PlataOrder = mongoose.model("PlataOrder", plataOrderSchema);
