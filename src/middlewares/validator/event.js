/**
 * @swagger
 * components:
 *     schemas:
 *         EventToAdd:
 *             type: object
 *             description: Dates et heures à l'heure de Bruxelles
 *             properties:
 *                 name:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 100
 *                 description:
 *                     type: string
 *                     maxLength: 1000
 *                 image_url:
 *                     type: string
 *                     format: uri
 *                 start_date:
 *                     type: string
 *                     format: date
 *                     example: "2026-12-26"
 *                 end_date:
 *                     type: string
 *                     format: date
 *                     example: "2026-12-27"
 *                 start_time:
 *                     type: string
 *                     pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                     example: "22:00"
 *                 end_time:
 *                     type: string
 *                     pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                     example: "04:00"
 *                 latitude:
 *                     type: number
 *                     minimum: -90
 *                     maximum: 90
 *                 longitude:
 *                     type: number
 *                     minimum: -180
 *                     maximum: 180
 *                 capacity:
 *                     type: integer
 *                     minimum: 1
 *                     example: 500
 *                 status:
 *                     type: string
 *                     enum: [DRAFT, PUBLISHED, CANCELLED, FINISHED]
 *                     default: DRAFT
 *                 category_name:
 *                     type: string
 *                     maxLength: 25
 *                     example: PARTY
 *             required:
 *                 - name
 *                 - start_date
 *                 - end_date
 *                 - start_time
 *                 - end_time
 *                 - capacity
 *                 - category_name
 *         EventToUpdate:
 *             type: object
 *             description: Mêmes champs que EventToAdd, tous facultatifs (au moins un champ est requis)
 *             properties:
 *                 name:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 100
 *                 description:
 *                     type: string
 *                     maxLength: 1000
 *                 image_url:
 *                     type: string
 *                     format: uri
 *                 start_date:
 *                     type: string
 *                     format: date
 *                 end_date:
 *                     type: string
 *                     format: date
 *                 start_time:
 *                     type: string
 *                     pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 end_time:
 *                     type: string
 *                     pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 latitude:
 *                     type: number
 *                     minimum: -90
 *                     maximum: 90
 *                 longitude:
 *                     type: number
 *                     minimum: -180
 *                     maximum: 180
 *                 capacity:
 *                     type: integer
 *                     minimum: 1
 *                 status:
 *                     type: string
 *                     enum: [DRAFT, PUBLISHED, CANCELLED, FINISHED]
 *                 category_name:
 *                     type: string
 *                     maxLength: 25
 */

import vine from "@vinejs/vine";

const date = () => vine.date({formats: ["YYYY-MM-DD"]})
    .transform(d => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())));

const time = () => vine.date({formats: ["HH:mm"]})
    .transform(d => new Date(Date.UTC(2000, 0, 1, d.getHours(), d.getMinutes())));

const status = () => vine.enum(["DRAFT", "PUBLISHED", "CANCELLED", "FINISHED"]);

const filterEventValidator = vine.create(vine.object({
    status: vine.array(status()).optional(),
    category_name: vine.string().trim().toUpperCase().maxLength(25).optional(),
    organizer_id: vine.number().withoutDecimals().positive().optional()
}));

const addEventValidator = vine.create(vine.object({
    name: vine.string().trim().minLength(1).maxLength(100),
    description: vine.string().trim().maxLength(1000).optional(),
    image_url: vine.string().trim().url().optional(),
    start_date: date(),
    end_date: date(),
    start_time: time(),
    end_time: time(),
    latitude: vine.number().range([-90, 90]).optional(),
    longitude: vine.number().range([-180, 180]).optional(),
    capacity: vine.number().withoutDecimals().positive(),
    status: status().optional(),
    category_name: vine.string().trim().toUpperCase().maxLength(25)
}));

const updateEventValidator = vine.create(vine.object({
    id: vine.number().withoutDecimals().positive(),
    name: vine.string().trim().minLength(1).maxLength(100).optional(),
    description: vine.string().trim().maxLength(1000).optional(),
    image_url: vine.string().trim().url().optional(),
    start_date: date().optional(),
    end_date: date().optional(),
    start_time: time().optional(),
    end_time: time().optional(),
    latitude: vine.number().range([-90, 90]).optional(),
    longitude: vine.number().range([-180, 180]).optional(),
    capacity: vine.number().withoutDecimals().positive().optional(),
    status: status().optional(),
    category_name: vine.string().trim().toUpperCase().maxLength(25).optional()
}));

export const filterEvent = async (req, res, next) => {
    try {
        const query = {...req.query};
        if(typeof query.status === "string"){
            query.status = query.status.split(",");
        }
        req.val = await filterEventValidator.validate(query);
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};

export const addEvent = async (req, res, next) => {
    try {
        req.val = await addEventValidator.validate(req.body ?? {});
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};

export const updateEvent = async (req, res, next) => {
    try {
        req.val = await updateEventValidator.validate({...req.body, id: req.params.id});
        if(Object.keys(req.val).length === 1){
            return res.status(400).send("Aucun champ à modifier");
        }
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};
