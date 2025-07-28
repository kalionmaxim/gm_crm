const config = require("../config/config");
const { pumbLogger } = require("./logger");

// Якщо буде авторизація (Basic або інша) — можеш підключити модулі
// const crypto = require("crypto");
// const axios = require("axios");

const PUMB_SECRET = config.get("pumb:secretKey") || ""; // Якщо буде
const ENABLE_LOG = true;

module.exports = {
  async handlePumbCallback(data) {
    try {
      if (ENABLE_LOG) {
        pumbLogger.info("🔔 PUMB callback received", data);
      }

      // TODO: валідація запиту (в залежності від формату ПУМБ)

      // приклад мінімальної перевірки
      if (!data || typeof data !== "object") {
        return {
          status: "error",
          message: "Invalid body"
        };
      }

      // Тут може бути бізнес-логіка (наприклад, збереження в БД або CRM)
      // await processPumbPayload(data);

      return {
        status: "ok",
        received: true
      };
    } catch (err) {
      pumbLogger.error("Error in handlePumbCallback:", err);

      return {
        status: "error",
        message: "Internal server error"
      };
    }
  }
};

exports.handlePumbCallback = async (req, res) => {
  try {
    console.log("PUMB callback received:", req.body);

    // Тестовий лог і відповідь
    res.status(200).json({ status: "ok", received: req.body });
  } catch (error) {
    console.error("PUMB callback error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
