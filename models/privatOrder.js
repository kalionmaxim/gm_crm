const mongoose = require("../lib/mongoose");
const autoIncrement = require("../lib/mongoose").autoIncrement;

const processingStatuses = ["not_processed", "processing", "processed"];

const Schema = mongoose.Schema;

const privatOrderSchema = new Schema({
	privat_order_id: { type: Number, unique: true },

	internal_order_id: { type: String },

	invoice: {
		date: { type: String }, //yyyy-MM-dd
		number: { type: String },
		point_id: { type: String },
		paymentState: { type: String },
		source: { type: String } // "STORE", "INTERNET"
	},

	amount: { type: Number },
	partsCount: { type: Number },
	currency: { type: String },
	merchantType: { type: String },
	products: [{
		name: { type: String },
		count: { type: Number },
		price: { type: Number }
	}],
	responseUrl: { type: String },
	redirectUrl: { type: String },

	product_id: { type: String },
	product_name: { type: String },

	phone: { type: String },
	email: { type: String },
	name: { type: String },

	status: { type: String, enum: processingStatuses, default: processingStatuses[0] },
	state: { type: String },
	token: { type: String }
});

privatOrderSchema.plugin(autoIncrement.plugin, {
	model: "PrivatOrder",
	field: "privat_order_id",
	startAt: 1,
	incrementBy: 1
});

exports.PrivatOrder = mongoose.model("PrivatOrder", privatOrderSchema);
