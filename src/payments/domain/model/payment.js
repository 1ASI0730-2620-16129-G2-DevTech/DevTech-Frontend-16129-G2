import {PaymentStatus, PAYMENT_STATUSES} from "./payment-status.js";

export class Payment {
    constructor({
        id,
        orderId,
        customerId,
        customerName,
        amount,
        paymentMethod,
        status = PaymentStatus.PENDING,
        paidAt = null,
        orderDate,
    }) {
        if (!id || !orderId || !customerId || !customerName) throw new Error("Payment identifiers are required");
        if (typeof amount !== "number" || amount < 0) throw new Error("Payment amount must be a positive number");
        if (!PAYMENT_STATUSES.includes(status)) throw new Error(`Payment status must be one of ${PAYMENT_STATUSES.join(", ")}`);

        this.id = id;
        this.orderId = orderId;
        this.customerId = customerId;
        this.customerName = customerName;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.paidAt = paidAt ? new Date(paidAt) : null;
        this.orderDate = new Date(orderDate);
        Object.freeze(this);
    }

    isPaid() { return this.status === PaymentStatus.PAID; }
    isPending() { return this.status === PaymentStatus.PENDING; }
    isCancelled() { return this.status === PaymentStatus.CANCELLED; }
}