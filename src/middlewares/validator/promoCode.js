/**
 * @swagger
 * components:
 *     schemas:
 *         PromoCodeToAdd:
 *             type: object
 *             description: The event is the one in the URL. The code must be unique
 *             properties:
 *                 code:
 *                     description: Converted to uppercase
 *                     type: string
 *                     pattern: '^[A-Za-z0-9_-]+$'
 *                     minLength: 1
 *                     maxLength: 50
 *                     example: CHRISTMAS10
 *                 discount_type:
 *                     type: string
 *                     enum: [PERCENTAGE, FIXED_AMOUNT]
 *                     example: PERCENTAGE
 *                 discount_value:
 *                     type: number
 *                     exclusiveMinimum: true
 *                     minimum: 0
 *                     maximum: 99999999.99
 *                     description: Percentage (100 at most) or amount in euros, up to 2 decimal places
 *                     example: 10
 *                 start_at:
 *                     type: string
 *                     format: date-time
 *                     example: 2026-12-01T00:00:00+01:00
 *                 end_at:
 *                     type: string
 *                     format: date-time
 *                     description: Must be after start_at
 *                     example: 2026-12-25T23:59:59+01:00
 *                 max_uses:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 2147483647
 *                     description: No limit if omitted
 *                     example: 100
 *                 min_order_amount:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 99999999.99
 *                     default: 0
 *                     description: Amount in euros, up to 2 decimal places
 *                     example: 20
 *                 is_active:
 *                     type: boolean
 *                     default: true
 *             required:
 *                 - code
 *                 - discount_type
 *                 - discount_value
 *                 - start_at
 *                 - end_at
 *         PromoCodeToUpdate:
 *             type: object
 *             description: Same fields as PromoCodeToAdd, all optional (at least one field is required). The event cannot be changed
 *             properties:
 *                 code:
 *                     description: Converted to uppercase
 *                     type: string
 *                     pattern: '^[A-Za-z0-9_-]+$'
 *                     minLength: 1
 *                     maxLength: 50
 *                     example: CHRISTMAS20
 *                 discount_type:
 *                     type: string
 *                     enum: [PERCENTAGE, FIXED_AMOUNT]
 *                 discount_value:
 *                     type: number
 *                     exclusiveMinimum: true
 *                     minimum: 0
 *                     maximum: 99999999.99
 *                     description: Percentage (100 at most) or amount in euros, up to 2 decimal places
 *                     example: 20
 *                 start_at:
 *                     type: string
 *                     format: date-time
 *                 end_at:
 *                     type: string
 *                     format: date-time
 *                     description: Must be after start_at
 *                 max_uses:
 *                     type: integer
 *                     nullable: true
 *                     minimum: 1
 *                     maximum: 2147483647
 *                     description: null removes the limit
 *                 min_order_amount:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 99999999.99
 *                 is_active:
 *                     type: boolean
 */

import vine from "@vinejs/vine";

const percentageLimit = vine.createRule((value, _, field) => {
    if(field.parent.discount_type === "PERCENTAGE" && value > 100){
        field.report("The {{ field }} field must not exceed 100 for a percentage", "percentageLimit", field);
    }
});

const id = () => vine.number().withoutDecimals().positive();
const code = () => vine.string().trim().toUpperCase().regex(/^[A-Z0-9_-]+$/).minLength(1).maxLength(50);
const discountType = () => vine.enum(["PERCENTAGE", "FIXED_AMOUNT"]);
const discountValue = () => vine.number().positive().max(99999999.99).decimal([0, 2]).use(percentageLimit());
const startAt = () => vine.date({formats: ["iso8601"]});
const endAt = () => vine.date({formats: ["iso8601"]}).afterField("start_at", {compare: "second", format: ["iso8601"]});
const maxUses = () => vine.number().withoutDecimals().range([1, 2147483647]);
const minOrderAmount = () => vine.number().range([0, 99999999.99]).decimal([0, 2]);

const addPromoCodeValidator = vine.create(vine.object({
    event_id: id(),
    code: code(),
    discount_type: discountType(),
    discount_value: discountValue(),
    start_at: startAt(),
    end_at: endAt(),
    max_uses: maxUses().optional(),
    min_order_amount: minOrderAmount().optional(),
    is_active: vine.boolean().optional()
}));

const updatePromoCodeValidator = vine.create(vine.object({
    id: id(),
    code: code().optional(),
    discount_type: discountType().optional(),
    discount_value: discountValue().optional(),
    start_at: startAt().optional(),
    end_at: endAt().optional(),
    max_uses: maxUses().nullable().optional(),
    min_order_amount: minOrderAmount().optional(),
    is_active: vine.boolean().optional()
}));

export const addPromoCode = async (req, res, next) => {
    try {
        req.val = await addPromoCodeValidator.validate({...req.body, event_id: req.params.id});
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const updatePromoCode = async (req, res, next) => {
    try {
        req.val = await updatePromoCodeValidator.validate({...req.body, id: req.params.id});
        if(Object.keys(req.val).length === 1){
            return res.status(400).send("No field to update");
        }
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};
