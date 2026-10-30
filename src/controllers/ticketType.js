/**
 * @swagger
 * components:
 *     schemas:
 *         TicketType:
 *             type: object
 *             properties:
 *                 id:
 *                     type: integer
 *                     example: 4
 *                 name:
 *                     type: string
 *                     example: Pass 2 jours
 *                 description:
 *                     type: string
 *                     nullable: true
 *                     example: Accès aux deux journées du festival
 *                 price:
 *                     type: string
 *                     description: Prix en euros, nombre décimal renvoyé sous forme de texte (sans les zéros inutiles, ex. "45" ou "22.5")
 *                     example: "79.99"
 *                 available_quantity:
 *                     type: integer
 *                     description: Nombre de billets encore disponibles à la vente
 *                     example: 1500
 *                 event_id:
 *                     type: integer
 *                     description: Identifiant de l'événement auquel appartient ce type de billet
 *                     example: 2
 */

import prisma from "../database/database.js";
import * as ticketTypeModel from "../models/ticketType.js";
import * as eventModel from "../models/event.js";
import {sendError} from "../utils/sendError.js";

const canManage = (session, event) =>
    session.role === "ADMIN" || event.organizer_id === session.id;

export const getTicketTypeByEvent = async (req, res) => {
    try {
        const event = await eventModel.readEventById(prisma, {id: req.val.event_id});
        if(!event || (event.status === "DRAFT" && !canManage(req.session, event))){
            return res.sendStatus(404);
        }
        const ticketTypes = await ticketTypeModel.readTicketTypeByEvent(prisma, {event_id: event.id});
        res.send(ticketTypes);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const addTicketType = async (req, res) => {
    try {
        const event = await eventModel.readEventById(prisma, {id: req.val.event_id});
        if(!event){
            return res.sendStatus(404);
        }
        if(!canManage(req.session, event)){
            return res.sendStatus(403);
        }
        const id = await ticketTypeModel.createTicketType(prisma, {...req.val, event_id: event.id});
        res.status(201).json({id});
    } catch (err) {
        sendError(req, res, err);
    }
};

export const updateTicketType = async (req, res) => {
    try {
        const fields = req.val;
        const ticketType = await ticketTypeModel.readTicketTypeById(prisma, {id: fields.id});
        if(!ticketType){
            return res.sendStatus(404);
        }
        const event = await eventModel.readEventById(prisma, {id: ticketType.event_id});
        if(!canManage(req.session, event)){
            return res.sendStatus(403);
        }
        await ticketTypeModel.updateTicketType(prisma, fields);
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const deleteTicketType = async (req, res) => {
    try {
        const ticketType = await ticketTypeModel.readTicketTypeById(prisma, {id: req.val.id});
        if(!ticketType){
            return res.sendStatus(404);
        }
        const event = await eventModel.readEventById(prisma, {id: ticketType.event_id});
        if(!canManage(req.session, event)){
            return res.sendStatus(403);
        }
        await ticketTypeModel.deleteTicketType(prisma, {id: req.val.id});
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};
