const mongoose = require("../lib/mongoose");
const autoIncrement = require("../lib/mongoose").autoIncrement;

const Schema = mongoose.Schema;

const statuses = ["approved", "signed", "rejected", "canceled"];
const processingStatuses = ["not_processed", "processing", "processed"];

const tinkoffOrderSchema = new Schema({
	tinkoff_order_id: { type: Number, unique: true, index: true },

	internal_order_id: { type: String, unique: true },

	salesOrderID: { type: String },

	amount: { type: Number, required: true }, // сумма

	currency: { type: String },

	processingStatus: { type: String, enum: processingStatuses },

	description: { type: String },

	zoho: {
		productID: { type: String },
		productName: { type: String }
	},

	items: [{
		name: { type: String },
		price: { type: Number },
		quantity: { type: Number },
		category: { type: String },
		vendorCode: { type: String }
	}],

	promoCode: { type: String },

	id: { type: String, index: true }, // id ордера, который генерируется на стороне Tinkoff
	status: { type: String, enum: statuses }, // status ордера на стороне Tinkoff
	created_at: { type: Date },
	first_payment: { type: Number },
	order_amount: { type: Number },
	credit_amount: { type: Number },
	product: { type: String },
	term: { type: Number },
	monthly_payment: { type: Number },
	loan_number: { type: String },
	signing_type: { type: String },

	email: { type: String },
	phone: { type: String },
	first_name: { type: String },
	last_name: { type: String },
	middle_name: { type: String }

}, { timestamps: true });

tinkoffOrderSchema.plugin(autoIncrement.plugin, {
	model: "TinkoffOrder",
	field: "tinkoff_order_id",
	startAt: 1,
	incrementBy: 1
});

exports.TinkoffOrder = mongoose.model("TinkoffOrder", tinkoffOrderSchema);
