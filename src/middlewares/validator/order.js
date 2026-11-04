/**
 * @swagger
 * components:
 *     schemas:
 *         OrderToAdd:
 *             type: object
 *             description: All the ticket types of an order must belong to the same event
 *             properties:
 *                 items:
 *                     type: array
 *                     minItems: 1
 *                     maxItems: 20
 *                     description: Each ticket type can only appear once
 *                     items:
 *                         type: object
 *                         properties:
 *                             ticket_type_id:
 *                                 type: integer
 *                                 minimum: 1
 *                                 example: 4
 *                             quantity:
 *                                 type: integer
 *                                 minimum: 1
 *                                 maximum: 20
 *                                 example: 2
 *                         required:
 *                             - ticket_type_id
 *                             - quantity
 *                 promo_code:
 *                     type: string
 *                     maxLength: 50
 *                     example: CHRISTMAS10
 *             required:
 *                 - items
 *         GuestOrderToAdd:
 *             allOf:
 *                 - $ref: '#/components/schemas/OrderToAdd'
 *                 - type: object
 *                   properties:
 *                       user:
 *                           $ref: '#/components/schemas/UserToRegister'
 *                   required:
 *                       - user
 *         OrderToPay:
 *             type: object
 *             properties:
 *                 payment_method:
 *                     type: string
 *                     enum: [pm_card_visa, pm_card_chargeDeclined]
 *                     description: Simulated Stripe test card (pm_card_visa is accepted, pm_card_chargeDeclined is declined)
 *                     example: pm_card_visa
 *             required:
 *                 - payment_method
 */

import vine from "@vinejs/vine";
import {PAYMENT_METHODS} from "../../utils/fakeStripe.js";
import {registerFields} from "./user.js";

const orderFields = {
    items: vine.array(vine.object({
        ticket_type_id: vine.number().withoutDecimals().positive(),
        quantity: vine.number().withoutDecimals().range([1, 20])
    })).minLength(1).maxLength(20).distinct("ticket_type_id"),
    promo_code: vine.string().trim().toUpperCase().maxLength(50).optional()
};

const addOrderValidator = vine.create(vine.object(orderFields));

const addGuestOrderValidator = vine.create(vine.object({
    ...orderFields,
    user: vine.object(registerFields)
}));

const payOrderValidator = vine.create(vine.object({
    id: vine.number().withoutDecimals().positive(),
    payment_method: vine.enum(Object.keys(PAYMENT_METHODS))
}));

export const addOrder = async (req, res, next) => {
    try {
        req.val = await addOrderValidator.validate(req.body ?? {});
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const addGuestOrder = async (req, res, next) => {
    try {
        req.val = await addGuestOrderValidator.validate(req.body ?? {});
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const payOrder = async (req, res, next) => {
    try {
        req.val = await payOrderValidator.validate({...req.body, id: req.params.id});
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};
