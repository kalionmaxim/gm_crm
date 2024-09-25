const mongoose = require("../lib/mongoose");
const autoIncrement = require("../lib/mongoose").autoIncrement;

const Schema = mongoose.Schema;

const monoOrderSchema = new Schema({
	createdAt: { type: Date, default: Date.now() },
	mono_order_id     : { type: Number, unique: true },
	external_order_id : { type: String, index: true },
	client_phone      : { type: String },
	total_sum         : { type: Number },

	salesOrderID      : { type: String },

	invoice           : {
		date    : { type: String }, //yyyy-MM-dd
		number  : { type: String },
		point_id: { type: String },
		source  : { type: String } // "STORE", "INTERNET"
	},
	available_programs: [{
		available_parts_count: [{ type: Number }],
		type                 : { type: String } // "payment_installments"
	}],
	products          : [{
		name : { type: String },
		count: { type: Number },
		sum  : { type: Number }
	}],
	result_callback   : { type: String },
	additional_params : {
		nds         : { type: Number },
		seller_phone: { type: String }
	},

	product_name : { type: String },

	email    : { type: String },
	name     : { type: String },
	state    : { type: String },
	sub_state: { type: String },
	page     : { type: Schema.Types.ObjectId, ref: "Page" },
	returned : { type: Boolean, default: false },
	rejected : { type: Boolean, default: false }
});

monoOrderSchema.plugin(autoIncrement.plugin, {
	model      : "MonoOrder",
	field      : "mono_order_id",
	startAt    : 1,
	incrementBy: 1
});

exports.MonoOrder = mongoose.model("MonoOrder", monoOrderSchema);
