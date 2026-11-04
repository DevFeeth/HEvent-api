import {randomUUID} from "node:crypto";

// Simulates a Stripe PaymentIntent: no network call and no real money.
// These are the test payment methods that exist in Stripe. To switch to real payments, replace this file.
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
