/**
 * @swagger
 * components:
 *     schemas:
 *         PromoCode:
 *             type: object
 *             properties:
 *                 id:
 *                     type: integer
 *                     example: 3
 *                 code:
 *                     type: string
 *                     example: CHRISTMAS10
 *                 discount_type:
 *                     type: string
 *                     enum: [PERCENTAGE, FIXED_AMOUNT]
 *                 discount_value:
 *                     type: string
 *                     description: Decimal number returned as a string
 *                     example: "10"
 *                 start_at:
 *                     type: string
 *                     format: date-time
 *                 end_at:
 *                     type: string
 *                     format: date-time
 *                 max_uses:
 *                     type: integer
 *                     nullable: true
 *                     example: 100
 *                 min_order_amount:
 *                     type: string
 *                     description: Decimal number returned as a string
 *                     example: "20"
 *                 is_active:
 *                     type: boolean
 *                 event_id:
 *                     type: integer
 *                     description: ID of the event this promo code belongs to
 *                     example: 2
 */

import prisma from "../database/database.js";
import * as promoCodeModel from "../models/promoCode.js";
import * as eventModel from "../models/event.js";
import {sendError} from "../utils/sendError.js";

const canManage = (session, event) => session?.role === "ADMIN" || event.organizer_id === session?.id;

const inconsistencyAfterUpdate = (promoCode, fields) => {
    const type = fields.discount_type ?? promoCode.discount_type;
    const value = fields.discount_value ?? Number(promoCode.discount_value);
    if(type === "PERCENTAGE" && value > 100){
        return "The discount value must not exceed 100 for a percentage";
    }
    if((fields.end_at ?? promoCode.end_at) <= (fields.start_at ?? promoCode.start_at)){
        return "The end date must be after the start date";
    }
    return null;
};

export const getPromoCodesByEvent = async (req, res) => {
    try {
        const event = await eventModel.readEventById(prisma, {id: req.val.id});
        if(!event){
            return res.sendStatus(404);
        }
        if(!canManage(req.session, event)){
            return res.sendStatus(403);
        }
        const promoCodes = await promoCodeModel.readPromoCodeByEventId(prisma, {event_id: event.id});
        res.send(promoCodes);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const addPromoCode = async (req, res) => {
    try {
        const event = await eventModel.readEventById(prisma, {id: req.val.event_id});
        if(!event){
            return res.sendStatus(404);
        }
        if(!canManage(req.session, event)){
            return res.sendStatus(403);
        }
        const id = await promoCodeModel.createPromoCode(prisma, {...req.val, event_id: event.id});
        res.status(201).json({id});
    } catch (err) {
        sendError(req, res, err);
    }
};

export const updatePromoCode = async (req, res) => {
    try {
        const fields = req.val;
        const promoCode = await promoCodeModel.readPromoCodeById(prisma, {id: fields.id});
        if(!promoCode){
            return res.sendStatus(404);
        }
        const event = await eventModel.readEventById(prisma, {id: promoCode.event_id});
        if(!canManage(req.session, event)){
            return res.sendStatus(403);
        }
        const inconsistency = inconsistencyAfterUpdate(promoCode, fields);
        if(inconsistency){
            return res.status(400).send(inconsistency);
        }
        await promoCodeModel.updatePromoCode(prisma, fields);
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const deletePromoCode = async (req, res) => {
    try {
        const promoCode = await promoCodeModel.readPromoCodeById(prisma, {id: req.val.id});
        if(!promoCode){
            return res.sendStatus(404);
        }
        const event = await eventModel.readEventById(prisma, {id: promoCode.event_id});
        if(!canManage(req.session, event)){
            return res.sendStatus(403);
        }
        await promoCodeModel.deletePromoCode(prisma, {id: req.val.id});
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};
