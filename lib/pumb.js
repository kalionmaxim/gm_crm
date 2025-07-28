const config = require("../config/config");
const logger = require("../lib/logger").pumbLogger || console;
const crypto = require("crypto");

const PUMB_SECRET = config.get("pumb:secret");

function validateSignature(req) {
  const signatureHeader = req.headers["x-signature"];
  const payload = JSON.stringify(req.body);
  const computedSignature = crypto
    .createHmac("sha256", PUMB_SECRET)
    .update(payload)
    .digest("hex");

  return signatureHeader === computedSignature;
}

async function handlePumbCallback(req, res) {
  try {
    if (!validateSignature(req)) {
      logger.error("Invalid signature");
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const data = req.body;
    logger.info("PUMB callback data received:", data);

    // TODO: Process the data here (create order, update status, etc.)

    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error("PUMB callback error:", err);
    return res.status(500).json({ success: false });
  }
}

module.exports = {
  handlePumbCallback
};
