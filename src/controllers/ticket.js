/**
 * @swagger
 * components:
 *     schemas:
 *         Ticket:
 *             type: object
 *             properties:
 *                 id:
 *                     type: integer
 *                     example: 18
 *                 status:
 *                     type: string
 *                     enum: [VALID, USED, CANCELLED]
 *                 used_at:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                 purchase_price:
 *                     type: string
 *                     description: Decimal number returned as a string
 *                     example: "79.99"
 *                 ticket_type_id:
 *                     type: integer
 *                     example: 4
 *                 order_id:
 *                     type: integer
 *                     example: 7
 *                 owner_id:
 *                     type: integer
 *                     example: 1
 *         TicketQrToken:
 *             type: object
 *             properties:
 *                 qr_token:
 *                     type: string
 *                     description: Value to display as a QR code
 *                     example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expires_in:
 *                     type: integer
 *                     description: Lifetime of this token in seconds. Ask for a new one every 15 seconds
 *                     example: 30
 *         TicketOwner:
 *             type: object
 *             properties:
 *                 id:
 *                     type: integer
 *                     example: 1
 *                 first_name:
 *                     type: string
 *                     example: Ulysse
 *                 last_name:
 *                     type: string
 *                     example: User
 *                 email:
 *                     type: string
 *                     format: email
 *                     example: user@mail.com
 *         TicketWithEvent:
 *             allOf:
 *                 - $ref: '#/components/schemas/Ticket'
 *                 - type: object
 *                   properties:
 *                       ticket_type:
 *                           allOf:
 *                               - $ref: '#/components/schemas/TicketType'
 *                               - type: object
 *                                 properties:
 *                                     event:
 *                                         $ref: '#/components/schemas/Event'
 *         TicketDetails:
 *             allOf:
 *                 - $ref: '#/components/schemas/TicketWithEvent'
 *                 - type: object
 *                   properties:
 *                       orders:
 *                           type: object
 *                           properties:
 *                               status:
 *                                   type: string
 *                                   enum: [PENDING, PAID, CANCELLED, REFUNDED]
 *                       users:
 *                           $ref: '#/components/schemas/TicketOwner'
 *         EventTicket:
 *             type: object
 *             description: A ticket as seen by the event organizer
 *             properties:
 *                 id:
 *                     type: integer
 *                     example: 18
 *                 status:
 *                     type: string
 *                     enum: [VALID, USED, CANCELLED]
 *                 used_at:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                 purchase_price:
 *                     type: string
 *                     description: Decimal number returned as a string
 *                     example: "79.99"
 *                 ticket_type_id:
 *                     type: integer
 *                     example: 4
 *                 order_id:
 *                     type: integer
 *                     example: 7
 *                 owner_id:
 *                     type: integer
 *                     example: 1
 *                 ticket_type:
 *                     type: object
 *                     properties:
 *                         id:
 *                             type: integer
 *                             example: 4
 *                         name:
 *                             type: string
 *                             example: VIP
 *                 users:
 *                     $ref: '#/components/schemas/TicketOwner'
 */

import prisma from "../database/database.js";
import * as ticketModel from "../models/ticket.js";
import * as orderModel from "../models/order.js";
import * as eventModel from "../models/event.js";
import {sendError} from "../utils/sendError.js";
import {QR_TOKEN_LIFETIME, signQrToken, readQrToken} from "../utils/qrToken.js";
import {today} from "../utils/eventDate.js";
import {syncPendingOrderAmounts} from "./order.js";

const canManage = (session, event) => session.role === "ADMIN" || event.organizer_id === session.id;

const entryRefusal = (ticket) => {
    if(ticket.status === "USED"){
        return "This ticket has already been used";
    }
    if(ticket.status === "CANCELLED"){
        return "This ticket has been cancelled";
    }
    if(ticket.orders.status !== "PAID"){
        return "The order of this ticket is not paid";
    }
    const {event} = ticket.ticket_type;
    if(event.status !== "PUBLISHED"){
        return "This event is not open for entry";
    }
    if(today() < event.start_date){
        return "This event has not started yet";
    }
    if(today() > event.end_date){
        return "This event is over";
    }
    return null;
};

export const getMyTickets = async (req, res) => {
    try {
        const tickets = await ticketModel.readTicketsByUserId(prisma, {
            owner_id: req.session.id,
            upcoming: req.val.upcoming
        });
        res.send(tickets);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const getTicketById = async (req, res) => {
    try {
        const ticket = await ticketModel.readTicketById(prisma, {id: req.val.id});
        if(!ticket){
            return res.sendStatus(404);
        }
        if(ticket.owner_id !== req.session.id && !canManage(req.session, ticket.ticket_type.event)){
            return res.sendStatus(403);
        }
        res.send(ticket);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const getTicketQrToken = async (req, res) => {
    try {
        const ticket = await ticketModel.readTicketById(prisma, {id: req.val.id});
        if(!ticket){
            return res.sendStatus(404);
        }
        if(ticket.owner_id !== req.session.id){
            return res.sendStatus(403);
        }
        const refusal = entryRefusal(ticket);
        if(refusal){
            return res.status(409).send(refusal);
        }
        res.send({
            qr_token: signQrToken({ticket_id: ticket.id}),
            expires_in: QR_TOKEN_LIFETIME
        });
    } catch (err) {
        sendError(req, res, err);
    }
};

export const getTicketsByEvent = async (req, res) => {
    try {
        const event = await eventModel.readEventById(prisma, {id: req.val.id});
        if(!event){
            return res.sendStatus(404);
        }
        if(!canManage(req.session, event)){
            return res.sendStatus(403);
        }
        const tickets = await ticketModel.readTicketsByEventId(prisma, {
            event_id: event.id,
            status: req.val.status
        });
        res.send(tickets);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const scanTicket = async (req, res) => {
    try {
        let ticketId;
        try {
            ticketId = readQrToken({qr_token: req.val.qr_token});
        } catch (err) {
            return res.status(400).send(err.name === "TokenExpiredError"
                ? "This QR code has expired, the ticket owner must refresh it"
                : "This QR code is not valid");
        }
        const ticket = await ticketModel.readTicketById(prisma, {id: ticketId});
        if(!ticket){
            return res.sendStatus(404);
        }
        if(!canManage(req.session, ticket.ticket_type.event)){
            return res.sendStatus(403);
        }
        const refusal = entryRefusal(ticket);
        if(refusal){
            return res.status(409).send(refusal);
        }
        if(!await ticketModel.markTicketAsUsed(prisma, {id: ticket.id})){
            return res.status(409).send("This ticket has already been used");
        }
        const scanned = await ticketModel.readTicketById(prisma, {id: ticket.id});
        res.send(scanned);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const cancelTicket = async (req, res) => {
    try {
        const ticket = await ticketModel.readTicketById(prisma, {id: req.val.id});
        if(!ticket){
            return res.sendStatus(404);
        }
        if(!canManage(req.session, ticket.ticket_type.event)){
            return res.sendStatus(403);
        }
        const cancelled = await prisma.$transaction(async (tx) => {
            await orderModel.lockOrderById(tx, {id: ticket.order_id});
            const done = await ticketModel.cancelTicket(tx, {id: ticket.id});
            if(done){
                await syncPendingOrderAmounts(tx, {id: ticket.order_id});
            }
            return done;
        });
        if(!cancelled){
            return res.status(409).send("Only a valid ticket can be cancelled");
        }
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};
