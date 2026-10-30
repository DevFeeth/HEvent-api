/**
 * @swagger
 * components:
 *     parameters:
 *         EventId:
 *             in: path
 *             name: event_id
 *             required: true
 *             description: Identifiant de l'événement
 *             schema:
 *                 type: integer
 *                 minimum: 1
 *     schemas:
 *         TicketTypeToAdd:
 *             type: object
 *             description: L'événement est celui de l'URL. Le nom doit être unique au sein de l'événement
 *             properties:
 *                 name:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                     example: VIP
 *                 description:
 *                     type: string
 *                     maxLength: 500
 *                     example: Accès balcon avec une boisson offerte
 *                 price:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 99999999.99
 *                     description: Prix en euros, maximum 2 décimales (0 pour un billet gratuit)
 *                     example: 55.00
 *                 available_quantity:
 *                     type: integer
 *                     minimum: 0
 *                     maximum: 2147483647
 *                     description: Nombre de billets mis en vente
 *                     example: 200
 *             required:
 *                 - name
 *                 - price
 *                 - available_quantity
 *         TicketTypeToUpdate:
 *             type: object
 *             description: Mêmes champs que TicketTypeToAdd, tous facultatifs (au moins un champ est requis). L'événement ne peut pas être changé
 *             properties:
 *                 name:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                     example: VIP Gold
 *                 description:
 *                     type: string
 *                     maxLength: 500
 *                     example: Accès balcon, boisson et vestiaire offerts
 *                 price:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 99999999.99
 *                     description: Prix en euros, maximum 2 décimales
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

const eventIdValidator = vine.create(vine.object({
    event_id: id()
}));

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

export const eventId = async (req, res, next) => {
    try {
        req.val = await eventIdValidator.validate(req.params);
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};

export const addTicketType = async (req, res, next) => {
    try {
        req.val = await addTicketTypeValidator.validate({...req.body, event_id: req.params.event_id});
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};

export const updateTicketType = async (req, res, next) => {
    try {
        req.val = await updateTicketTypeValidator.validate({...req.body, id: req.params.id});
        if(Object.keys(req.val).length === 1){
            return res.status(400).send("Aucun champ à modifier");
        }
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};
