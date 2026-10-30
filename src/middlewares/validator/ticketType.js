/**
 * @swagger
 * components:
 *     parameters:
 *         EventId:
 *             in: path
 *             name: event_id
 *             required: true
 *             description: Event ID
 *             schema:
 *                 type: integer
 *                 minimum: 1
 *     schemas:
 *         TicketTypeToAdd:
 *             type: object
 *             description: The event is the one in the URL. The name must be unique within the event
 *             properties:
 *                 name:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                     example: VIP
 *                 description:
 *                     type: string
 *                     maxLength: 500
 *                     example: Balcony access with a free drink
 *                 price:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 99999999.99
 *                     description: Price in euros, up to 2 decimal places (0 for a free ticket)
 *                     example: 55.00
 *                 available_quantity:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 2147483647
 *                     description: Number of tickets put on sale
 *                     example: 200
 *             required:
 *                 - name
 *                 - price
 *                 - available_quantity
 *         TicketTypeToUpdate:
 *             type: object
 *             description: Same fields as TicketTypeToAdd, all optional (at least one field is required). The event cannot be changed
 *             properties:
 *                 name:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                     example: VIP Gold
 *                 description:
 *                     type: string
 *                     maxLength: 500
 *                     example: Balcony access, free drink and cloakroom
 *                 price:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 99999999.99
 *                     description: Price in euros, up to 2 decimal places
 *                     example: 65.00
 *                 available_quantity:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 2147483647
 *                     example: 150
 */

import vine from "@vinejs/vine";

const id = () => vine.number().withoutDecimals().positive();
const price = () => vine.number().range([0, 99999999.99]).decimal([0, 2]);
const quantity = () => vine.number().withoutDecimals().range([0, 2147483647]);

const addTicketTypeValidator = vine.create(vine.object({
    event_id: id(),
    name: vine.string().trim().minLength(1).maxLength(50),
    description: vine.string().trim().maxLength(500).optional(),
    price: price(),
    available_quantity: quantity()
}));

const updateTicketTypeValidator = vine.create(vine.object({
    id: id(),
    name: vine.string().trim().minLength(1).maxLength(50).optional(),
    description: vine.string().trim().maxLength(500).optional(),
    price: price().optional(),
    available_quantity: quantity().optional()
}));

export const addTicketType = async (req, res, next) => {
    try {
        req.val = await addTicketTypeValidator.validate({...req.body, event_id: req.params.id});
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const updateTicketType = async (req, res, next) => {
    try {
        req.val = await updateTicketTypeValidator.validate({...req.body, id: req.params.id});
        if(Object.keys(req.val).length === 1){
            return res.status(400).send("No field to update");
        }
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};
