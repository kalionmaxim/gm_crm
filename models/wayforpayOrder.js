const mongoose = require("../lib/mongoose");
const autoIncrement = require("../lib/mongoose").autoIncrement;

const processingStatuses = ["not_processed", "processing", "processed"];

const Schema = mongoose.Schema;

const wayforpayOrderSchema = new Schema({
	wayforpay_order_id: { type: Number, unique: true },
	name: { type: String },
	productName: { type: String },
	amount: { type: Number },
	authCode: { type: String },
	cardPan: { type: String },
	cardType: { type: String },
	clientStartTime: { type: String },
	createdDate: { type: Number },
	currency: { type: String },
	email: { type: String },
	fee: { type: Number },
	issuerBankCountry: { type: String },
	issuerBankName: { type: String },
	merchantAccount: { type: String },
	merchantSignature: { type: String },
	orderReference: { type: String }, // sales order id here
	paymentSystem: { type: String },
	phone: { type: String },
	processingDate: { type: Number },
	reason: { type: String },
	reasonCode: { type: Number },
	recToken: { type: String },
	transactionStatus: { type: String },
	processingStatus: { type: String, enum: processingStatuses, default: processingStatuses[0] }
}, { timestamps: true });

wayforpayOrderSchema.plugin(autoIncrement.plugin, {
	model: "WayforpayOrder",
	field: "wayforpay_order_id",
	startAt: 1,
	incrementBy: 1
});

exports.WayforpayOrder = mongoose.model("WayforpayOrder", wayforpayOrderSchema);
