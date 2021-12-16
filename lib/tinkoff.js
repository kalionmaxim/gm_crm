const eLogger = require("../lib/logger").eLogger;
const iLogger = require("../lib/logger").iLogger;

const zoho = require("../lib/zohoCRM");

const TinkoffOrder = require("../models/tinkoffOrder").TinkoffOrder;

const { generateOrder } = require("../lib/orderGenerate");

class Tinkoff {
	async createOrder (body) {
		try {
			iLogger.info(`Tinkoff createOrder body: ${JSON.stringify(body)}`);

			const orderObj = {
				internal_order_id: "Genius_Marketing_Order_" + generateOrder(),
				salesOrderID: body.salesOrderID,
				processingStatus: "not_processed",
				amount: parseInt(body.amount, 10),
				currency: body.currency,
				items: [
					{
						name: body.productName,
						price: body.amount,
						quantity: 1
					}
				],
				promoCode: body.promoCode || undefined,
				description: "Покупка продукта " + body.productName,
				zoho: {
					productID: body.productID,
					productName: body.productName
				}
			};

			const createOrderResult = await TinkoffOrder.create(orderObj);
			if (createOrderResult) {
				return {
					result: 1,
					internal_order_id: createOrderResult.internal_order_id
				};
			} else {
				return {
					result: 0,
					error: "error while creating order"
				};
			}
		} catch (err) {
			eLogger.error("Tinkoff createOrder error: " + err);
			return {
				result: 0
			};
		}
	}

	async processCallback (body) {
		try {
			iLogger.info(`Tinkoff processCallback body: ${JSON.stringify(body)}`);

			const order = await TinkoffOrder.findOne({ internal_order_id: body.id });
			if (order) {
				order.status = body.status;
				order.created_at = body.created_at;
				order.first_payment = body.first_payment;
				order.order_amount = body.order_amount;
				order.credit_amount = body.credit_amount;
				order.product = body.product;
				order.term = body.term;
				order.monthly_payment = body.monthly_payment;
				order.loan_number = body.loan_number;
				order.signing_type = body.signing_type;
				order.email = body.email;
				order.phone = body.phone;
				order.first_name = body.first_name;
				order.last_name = body.last_name;
				order.middle_name = body.middle_name;
				order.processingStatus = "processed";

				const savedOrder = await order.save();
				if (savedOrder) {
					await this.sendDataToCrm(savedOrder);

					return {
						result: 1
					};
				} else {
					return {
						result: 0,
						error: "Error while saving error"
					};
				}
			} else {
				return {
					result: 0,
					error: "order not found"
				};
			}
		} catch (err) {
			eLogger.error("Tinkoff processCallback error: " + err);
			return {
				result: 0
			};
		}
	}

	async sendDataToCrm (order) {
		try {
			if (order) {
				const data = {
					invoice: order.salesOrderID,
					total_sum: order.amount,
					currency: order.currency,
					status: order.status,
					autooplata: false,
					sposob_oplaty: "Tinkoff"
				};

				await zoho.createPaymentV2(data);
			}

			return {
				result: 1
			};
		} catch (err) {
			eLogger.error(`Privat sendDataToCrm error: ${err}`);
			return {
				result: 0
			};
		}
	}
}

module.exports = new Tinkoff();
