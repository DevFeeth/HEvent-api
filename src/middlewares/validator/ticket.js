/**
 * @swagger
 * components:
 *     schemas:
 *         TicketToScan:
 *             type: object
 *             properties:
 *                 qr_token:
 *                     type: string
 *                     maxLength: 500
 *                     description: Value read from the ticket's QR code
 *                     example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             required:
 *                 - qr_token
 */

import vine from "@vinejs/vine";

const filterMyTicketsValidator = vine.create(vine.object({
    upcoming: vine.boolean().optional()
}));

const filterEventTicketsValidator = vine.create(vine.object({
    id: vine.number().withoutDecimals().positive(),
    status: vine.enum(["VALID", "USED", "CANCELLED"]).optional()
}));

const scanTicketValidator = vine.create(vine.object({
    qr_token: vine.string().trim().maxLength(500)
}));

export const filterMyTickets = async (req, res, next) => {
    try {
        req.val = await filterMyTicketsValidator.validate(req.query);
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const filterEventTickets = async (req, res, next) => {
    try {
        req.val = await filterEventTicketsValidator.validate({...req.query, id: req.params.id});
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const scanTicket = async (req, res, next) => {
    try {
        req.val = await scanTicketValidator.validate(req.body ?? {});
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};
