const mongoose = require("../lib/mongoose");
const autoIncrement = require("../lib/mongoose").autoIncrement;

const Schema = mongoose.Schema;

const plataOrderSchema = new Schema({
	createdAt: { type: Date, default: Date.now() },
	invoiceId: { type: String },

	// Info on checkout create
	salesOrderID: { type: String, required: true },
	email: { type: String, required: true },
	name: { type: String },
	phone: { type: String },
	productName: { type: String },
	productPrice: { type: Number },
	currency: { type: String },

	// Info from plata callback
	status: { type: String },
	finalAmount: { type: Number },
	payMethod: { type: String },
	paymentInfo: {
		rrn: { type: String },
		approvalCode: { type: String },
		tranId: { type: String },
		terminal: { type: String },
		bank: { type: String },
		paymentSystem: { type: String },
		country: { type: String },
		fee: { type: Number },
		paymentMethod: { type: String },
		maskedPan: { type: String },
	},
	failureReason: { type: String },
	errCode: { type: String },
});

plataOrderSchema.plugin(autoIncrement.plugin, {
	model: "PlataOrder",
	field: "plata_order_id",
	startAt: 1,
	incrementBy: 1,
});

exports.PlataOrder = mongoose.model("PlataOrder", plataOrderSchema);
