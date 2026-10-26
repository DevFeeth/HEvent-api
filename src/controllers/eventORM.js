import prisma from "../database/databaseORM.js";
import * as eventModel from "../models/event.js";

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
        console.error(err);
        res.sendStatus(500);
    }
};

export const getMyEvents = async (req, res) => {
    try {
        const events = await eventModel.readEvents(prisma, {organizer_id: req.session.id});
        res.send(events);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
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
        console.error(err);
        res.sendStatus(500);
    }
};

export const addEvent = async (req, res) => {
    try {
        const id = await eventModel.createEvent(prisma, {
            ...req.val, organizer_id: req.session.id
        });
        res.status(201).json({id});
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
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
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
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
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};
