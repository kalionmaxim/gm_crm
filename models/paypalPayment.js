const mongoose = require("../lib/mongoose");

const Schema = mongoose.Schema;

const paypalPaymentSchema = new Schema({
	paymentID   : { type: String, index: true },
	salesOrderID: { type: String },
	successURL  : { type: String },
	failureURL  : { type: String }
});

exports.PaypalPayment = mongoose.model("PaypalPayment", paypalPaymentSchema);
