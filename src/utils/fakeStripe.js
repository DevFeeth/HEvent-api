import {randomUUID} from "node:crypto";

export const PAYMENT_METHODS = {
    pm_card_visa: {status: "succeeded"},
    pm_card_chargeDeclined: {status: "requires_payment_method", error: "card_declined"}
};

export const createPaymentIntent = async ({amount, currency, payment_method}) => {
    return {
        id: `pi_fake_${randomUUID()}`,
        amount,
        currency,
        ...PAYMENT_METHODS[payment_method]
    };
};
