const logger = require("../lib/logger").eLogger;

async function handlePumbCallback(ctx) {
  try {
    const payload = ctx.request.body;

    logger.info("PUMB callback received", JSON.stringify(payload, null, 2));

    // TODO: додати перевірку підпису, якщо нададуть ключ
    // TODO: обробити payload при потребі

    ctx.status = 200;
    ctx.body = { success: true, message: "Callback accepted" };
  } catch (err) {
    logger.error("Error handling PUMB callback:", err);
    ctx.status = 500;
    ctx.body = { success: false, message: "Internal server error" };
  }
}

module.exports = { handlePumbCallback };
