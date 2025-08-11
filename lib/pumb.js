// pumb.js
const config = require("../config/config");
const { pLogger } = require("./logger");

const API_KEY = config.get("pumb:callbackApiKey") || "3s8CgWcWuxGaDQkJd4MUwBdPpF7";

async function handlePumbCallback(ctx, isTest = false) {
    try {
        // 1. Авторизація
        const authHeader = ctx.headers["authorization"] || ctx.headers["x-api-key"];
        if (!authHeader || authHeader !== API_KEY) {
            pLogger.warn(`[${isTest ? "TEST" : "PROD"}] PUMB callback unauthorized access attempt from IP: ${ctx.ip}`);
            ctx.status = 401;
            ctx.body = { success: false, message: "Unauthorized" };
            return;
        }

        // 2. Basic validation
        const data = ctx.request.body;
        const orderId = data.orderId || data.order_id;
        if (!orderId) {
            pLogger.error(`[${isTest ? "TEST" : "PROD"}] PUMB callback missing orderId from IP: ${ctx.ip}`);
            ctx.status = 400;
            ctx.body = { success: false, message: "orderId is required" };
            return;
        }

        // 3. Log callback data
        pLogger.info(`[${isTest ? "TEST" : "PROD"}] PUMB callback received for orderId: ${orderId}`, {
            orderId,
            data,
            ip: ctx.ip,
            userAgent: ctx.headers["user-agent"]
        });

        // 4. Business logic here (можеш просто логувати для тесту)
        // TODO: Add your business logic for processing PUMB payments
        // For example: update order status, create payment record, etc.

        // 5. Відповідь 200 OK
        ctx.status = 200;
        ctx.body = { success: true, message: "Callback received" };
        
        pLogger.info(`[${isTest ? "TEST" : "PROD"}] PUMB callback processed successfully for orderId: ${orderId}`);
        
    } catch (error) {
        pLogger.error(`[${isTest ? "TEST" : "PROD"}] PUMB callback error:`, error);
        ctx.status = 500;
        ctx.body = { success: false, message: "Internal server error" };
    }
}

module.exports = {
    handlePumbCallback,
};
