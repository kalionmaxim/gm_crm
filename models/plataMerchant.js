const mongoose = require("../lib/mongoose");
const autoIncrement = require("../lib/mongoose").autoIncrement;

const Schema = mongoose.Schema;

const plataMerchantsSchema = new Schema({
  plata_merchant_id: { type: Number, unique: true },
  ID: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: false },
});

plataMerchantsSchema.plugin(autoIncrement.plugin, {
  model: "PlataMerchant",
  field: "plata_merchant_id",
  startAt: 1,
  incrementBy: 1,
});

exports.PlataMerchant = mongoose.model("PlataMerchant", plataMerchantsSchema);
