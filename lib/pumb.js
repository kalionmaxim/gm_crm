// pumb.js
const config = require("../config/config"); // якщо ключ в конфіг
const API_KEY = config.get("pumb:apiKey") || "3s8CgWcWuxGaDQkJd4MUwBdPpF7";

async function handlePumbCallback(ctx, isTest = false) {
    // 1. Авторизація
    const authHeader = ctx.headers["authorization"] || ctx.headers["x-api-key"];
    if (!authHeader || authHeader !== API_KEY) {
        ctx.status = 401;
        ctx.body = { success: false, message: "Unauthorized" };
        return;
    }

    // 2. Basic validation
    const data = ctx.request.body;
    const orderId = data.orderId || data.order_id;
    if (!orderId) {
        ctx.status = 400;
        ctx.body = { success: false, message: "orderId is required" };
        return;
    }

    // 3. Business logic here (можеш просто логувати для тесту)
    console.log(`[${isTest ? "TEST" : "PROD"}] PUMB callback:`, data);

    // 4. Відповідь 200 OK
    ctx.status = 200;
    ctx.body = { success: true, message: "Callback received" };
}

module.exports = {
    handlePumbCallback,
};
