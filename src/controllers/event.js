/**
 * @swagger
 * components:
 *     schemas:
 *         Event:
 *             type: object
 *             properties:
 *                 id:
 *                     type: integer
 *                 name:
 *                     type: string
 *                 description:
 *                     type: string
 *                     nullable: true
 *                 image_url:
 *                     type: string
 *                     nullable: true
 *                 start_date:
 *                     type: string
 *                     description: Only the date part is relevant (YYYY-MM-DD)
 *                     example: "2026-12-26T00:00:00.000Z"
 *                 end_date:
 *                     type: string
 *                     example: "2026-12-27T00:00:00.000Z"
 *                 start_time:
 *                     type: string
 *                     description: Only the time part is relevant (HH:mm)
 *                     example: "2000-01-01T22:00:00.000Z"
 *                 end_time:
 *                     type: string
 *                     example: "2000-01-01T04:00:00.000Z"
 *                 latitude:
 *                     type: string
 *                     nullable: true
 *                     description: Decimal number returned as a string
 *                     example: "50.465000"
 *                 longitude:
 *                     type: string
 *                     nullable: true
 *                     example: "4.865000"
 *                 capacity:
 *                     type: integer
 *                 status:
 *                     type: string
 *                     enum: [DRAFT, PUBLISHED, CANCELLED, FINISHED]
 *                 created_at:
 *                     type: string
 *                     format: date-time
 *                 category_name:
 *                     type: string
 *                 organizer_id:
 *                     type: integer
 */

import prisma from "../database/database.js";
import * as eventModel from "../models/event.js";
import {sendError} from "../utils/sendError.js";

export const getEvents = async (req, res) => {
    try {
        const filters = {...req.val};
        if(req.session.role !== "ADMIN"){
            filters.status = (filters.status ?? ["PUBLISHED", "CANCELLED", "FINISHED"])
                .filter(s => s !== "DRAFT");
            if(filters.status.length === 0){
                return res.send([]);
            }
        }
        const events = await eventModel.readEvents(prisma, filters);
        res.send(events);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const getMyEvents = async (req, res) => {
    try {
        const events = await eventModel.readEvents(prisma, {organizer_id: req.session.id});
        res.send(events);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const getEventById = async (req, res) => {
    try {
        const event = await eventModel.readEventById(prisma, {id: req.val.id});
        const canSeeDraft = req.session.role === "ADMIN" || event?.organizer_id === req.session.id;
        if(event && (event.status !== "DRAFT" || canSeeDraft)){
            res.send(event);
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        sendError(req, res, err);
    }
};

export const addEvent = async (req, res) => {
    try {
        const id = await eventModel.createEvent(prisma, {
            ...req.val, organizer_id: req.session.id
        });
        res.status(201).json({id});
    } catch (err) {
        sendError(req, res, err);
    }
};

export const updateEvent = async (req, res) => {
    try {
        const fields = req.val;
        const event = await eventModel.readEventById(prisma, {id: fields.id});
        if(!event){
            return res.sendStatus(404);
        }
        if(req.session.role !== "ADMIN" && event.organizer_id !== req.session.id){
            return res.sendStatus(403);
        }
        await eventModel.updateEvent(prisma, fields);
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const event = await eventModel.readEventById(prisma, {id: req.val.id});
        if(!event){
            return res.sendStatus(404);
        }
        if(req.session.role !== "ADMIN" && event.organizer_id !== req.session.id){
            return res.sendStatus(403);
        }
        await eventModel.deleteEvent(prisma, {id: req.val.id});
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};
