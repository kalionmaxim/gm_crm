// lib/pumb.js

module.exports = {
    /**
     * Обробник колбеку ПУМБ
     * @param {Object} data — тіло запиту (ctx.request.body)
     * @param {Boolean} [isTest] — тестовий режим (опціонально)
     */
    async handlePumbCallback(data, isTest = false) {
        // 1. Логуємо для дебага
        console.log("[PUMB] Callback received:", data, "isTest:", isTest);

        // 2. Тут твоя основна логіка
        // Наприклад: перевірка полів, створення платежу, логування тощо
        if (!data || !data.orderId) {
            // Можна повертати спеціальну відповідь
            return { success: false, message: "orderId is required" };
        }

        // Якщо тестовий режим — повертаємо тестову відповідь
        if (isTest) {
            return { success: true, mode: "test", data };
        }

        // Тут основна обробка...
        // todo: твоя реальна бізнес-логіка

        // Повертаємо успіх
        return { success: true, orderId: data.orderId };
    }
};
