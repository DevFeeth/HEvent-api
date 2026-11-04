/**
 * @swagger
 * components:
 *     schemas:
 *         Order:
 *             type: object
 *             properties:
 *                 id:
 *                     type: integer
 *                     example: 7
 *                 subtotal:
 *                     type: string
 *                     description: Decimal number returned as a string
 *                     example: "100"
 *                 discount_amount:
 *                     type: string
 *                     description: Decimal number returned as a string
 *                     example: "10"
 *                 total:
 *                     type: string
 *                     description: Decimal number returned as a string
 *                     example: "90"
 *                 status:
 *                     type: string
 *                     enum: [PENDING, PAID, CANCELLED, REFUNDED]
 *                 created_at:
 *                     type: string
 *                     format: date-time
 *                 user_id:
 *                     type: integer
 *                     example: 1
 *                 promo_code_id:
 *                     type: integer
 *                     nullable: true
 *                     example: 3
 *                 promo_code:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                         code:
 *                             type: string
 *                             example: CHRISTMAS10
 *                 ticket:
 *                     type: array
 *                     items:
 *                         allOf:
 *                             - $ref: '#/components/schemas/Ticket'
 *                             - type: object
 *                               properties:
 *                                   ticket_type:
 *                                       type: object
 *                                       properties:
 *                                           id:
 *                                               type: integer
 *                                               example: 4
 *                                           name:
 *                                               type: string
 *                                               example: VIP
 *                                           event:
 *                                               type: object
 *                                               properties:
 *                                                   id:
 *                                                       type: integer
 *                                                       example: 2
 *                                                   name:
 *                                                       type: string
 *                                                       example: Festival
 *                                                   status:
 *                                                       type: string
 *                                                       enum: [DRAFT, PUBLISHED, CANCELLED, FINISHED]
 */

import prisma from "../database/database.js";
import * as orderModel from "../models/order.js";
import * as ticketModel from "../models/ticket.js";
import * as ticketTypeModel from "../models/ticketType.js";
import * as eventModel from "../models/event.js";
import * as promoCodeModel from "../models/promoCode.js";
import * as userModel from "../models/user.js";
import {createPaymentIntent} from "../utils/fakeStripe.js";
import {hash} from "../utils/hash.js";
import {signSessionToken} from "../utils/sessionToken.js";
import {sendError} from "../utils/sendError.js";
import {today} from "../utils/eventDate.js";

const MAX_AMOUNT_IN_CENTS = 9999999999;
const ORDER_LIFETIME_IN_MS = 15 * 60 * 1000;
const TRANSACTION_OPTIONS = {maxWait: 10000, timeout: 15000};

class OrderRefusal extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const toCents = (amount) => Math.round(Number(amount) * 100);
const toEuros = (cents) => cents / 100;

const discountInCents = async (tx, {code, event_id, subtotal}) => {
    const promoCode = await promoCodeModel.lockPromoCodeByCode(tx, {code});
    const now = new Date();
    if(!promoCode || promoCode.event_id !== event_id || !promoCode.is_active || now < promoCode.start_at || now > promoCode.end_at){
        throw new OrderRefusal(400, "This promo code is not valid");
    }
    if(subtotal < toCents(promoCode.min_order_amount)){
        throw new OrderRefusal(400, "The order amount is too low for this promo code");
    }
    if(promoCode.max_uses !== null && await promoCodeModel.countPromoCodeUses(tx, {id: promoCode.id}) >= promoCode.max_uses){
        throw new OrderRefusal(409, "This promo code has reached its usage limit");
    }
    const discount = promoCode.discount_type === "PERCENTAGE"
        ? Math.round(subtotal * Number(promoCode.discount_value) / 100)
        : toCents(promoCode.discount_value);
    return {id: promoCode.id, discount: Math.min(discount, subtotal)};
};

const createOrderWithTickets = async (tx, {items, promo_code, user_id}) => {
    const sortedItems = items.toSorted((a, b) => a.ticket_type_id - b.ticket_type_id);
    const ticketTypes = await ticketTypeModel.readTicketTypesByIds(tx, {ids: sortedItems.map(item => item.ticket_type_id)});
    if(ticketTypes.length !== sortedItems.length){
        throw new OrderRefusal(400, "A ticket type does not exist");
    }
    if(new Set(ticketTypes.map(ticketType => ticketType.event_id)).size !== 1){
        throw new OrderRefusal(400, "All the tickets of an order must belong to the same event");
    }

    const event = await eventModel.lockEventById(tx, {id: ticketTypes[0].event_id});
    if(event.status !== "PUBLISHED" || event.end_date < today()){
        throw new OrderRefusal(409, "This event is not open for sale");
    }
    const requested = sortedItems.reduce((sum, item) => sum + item.quantity, 0);
    if(await ticketModel.countActiveTicketsByEventId(tx, {event_id: event.id}) + requested > event.capacity){
        throw new OrderRefusal(409, "Not enough places left for this event");
    }

    const priceOf = (ticket_type_id) => toCents(ticketTypes.find(ticketType => ticketType.id === ticket_type_id).price);
    const subtotal = sortedItems.reduce((sum, item) => sum + priceOf(item.ticket_type_id) * item.quantity, 0);
    if(subtotal > MAX_AMOUNT_IN_CENTS){
        throw new OrderRefusal(400, "The order amount is too high");
    }

    const promo = promo_code
        ? await discountInCents(tx, {code: promo_code, event_id: event.id, subtotal})
        : {id: undefined, discount: 0};
    const total = subtotal - promo.discount;

    const orderId = await orderModel.createOrder(tx, {
        subtotal: toEuros(subtotal),
        discount_amount: toEuros(promo.discount),
        status: total === 0 ? "PAID" : "PENDING",
        user_id,
        promo_code_id: promo.id
    });

    for(const {ticket_type_id, quantity} of sortedItems){
        if(!await ticketTypeModel.decreaseAvailableQuantity(tx, {id: ticket_type_id, quantity})){
            throw new OrderRefusal(409, "Not enough tickets available");
        }
        await ticketModel.createTickets(tx, {
            ticket_type_id,
            order_id: orderId,
            owner_id: user_id,
            purchase_price: toEuros(subtotal === 0 ? 0 : Math.round(priceOf(ticket_type_id) * total / subtotal)),
            quantity
        });
    }
    return orderId;
};

const cancelPendingOrder = async (tx, {id}) => {
    if(!await orderModel.changePendingOrderStatus(tx, {id, status: "CANCELLED"})){
        return false;
    }
    const tickets = await ticketModel.cancelTicketsByOrderId(tx, {order_id: id});
    for(const {ticket_type_id} of tickets.toSorted((a, b) => a.ticket_type_id - b.ticket_type_id)){
        await ticketTypeModel.increaseAvailableQuantity(tx, {id: ticket_type_id, quantity: 1});
    }
    return true;
};

export const releaseExpiredOrders = async () => {
    const ids = await orderModel.readExpiredOrderIds(prisma, {before: new Date(Date.now() - ORDER_LIFETIME_IN_MS)});
    for(const id of ids){
        await prisma.$transaction(tx => cancelPendingOrder(tx, {id}));
    }
    return ids.length;
};

export const syncPendingOrderAmounts = async (tx, {id}) => {
    const order = await orderModel.lockOrderById(tx, {id});
    if(order.status !== "PENDING"){
        return;
    }
    const tickets = await ticketModel.readValidTicketsByOrderId(tx, {order_id: id});
    if(tickets.length === 0){
        await orderModel.changePendingOrderStatus(tx, {id, status: "CANCELLED"});
        return;
    }
    const total = tickets.reduce((sum, ticket) => sum + toCents(ticket.purchase_price), 0);
    const discount = Math.round(toCents(order.discount_amount) * total / toCents(order.total));
    await orderModel.updatePendingOrderAmounts(tx, {
        id,
        subtotal: toEuros(total + discount),
        discount_amount: toEuros(discount),
        status: total === 0 ? "PAID" : "PENDING"
    });
};

export const getMyOrders = async (req, res) => {
    try {
        const orders = await orderModel.readOrdersByUserId(prisma, {user_id: req.session.id});
        res.send(orders);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await orderModel.readOrderById(prisma, {id: req.val.id});
        if(!order){
            return res.sendStatus(404);
        }
        if(order.user_id !== req.session.id && req.session.role !== "ADMIN"){
            return res.sendStatus(403);
        }
        res.send(order);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const addOrder = async (req, res) => {
    try {
        const id = await prisma.$transaction(tx => createOrderWithTickets(tx, {...req.val, user_id: req.session.id}), TRANSACTION_OPTIONS);
        const order = await orderModel.readOrderById(prisma, {id});
        res.status(201).send(order);
    } catch (err) {
        if(err instanceof OrderRefusal){
            return res.status(err.status).send(err.message);
        }
        sendError(req, res, err);
    }
};

export const addGuestOrder = async (req, res) => {
    try {
        const {user: {password, ...fields}, items, promo_code} = req.val;
        const password_hash = await hash(password);
        const {user_id, order_id} = await prisma.$transaction(async (tx) => {
            const user_id = await userModel.createUser(tx, {...fields, password_hash});
            const order_id = await createOrderWithTickets(tx, {items, promo_code, user_id});
            return {user_id, order_id};
        }, TRANSACTION_OPTIONS);
        const order = await orderModel.readOrderById(prisma, {id: order_id});
        res.status(201).send({
            token: signSessionToken({id: user_id, role: "USER"}),
            order
        });
    } catch (err) {
        if(err instanceof OrderRefusal){
            return res.status(err.status).send(err.message);
        }
        if(err.code === "P2002"){
            return res.status(409).send("An account already exists with this email, please log in");
        }
        sendError(req, res, err);
    }
};

export const payOrder = async (req, res) => {
    try {
        const order = await orderModel.readOrderById(prisma, {id: req.val.id});
        if(!order){
            return res.sendStatus(404);
        }
        if(order.user_id !== req.session.id){
            return res.sendStatus(403);
        }
        if(order.status !== "PENDING"){
            return res.status(409).send("Only a pending order can be paid");
        }
        if(Date.now() - order.created_at.getTime() > ORDER_LIFETIME_IN_MS){
            return res.status(409).send("This order has expired");
        }
        if(order.ticket.every(ticket => ticket.ticket_type.event.status !== "PUBLISHED")){
            return res.status(409).send("This event is not open for sale");
        }
        const payment = await createPaymentIntent({
            amount: toCents(order.total),
            currency: "eur",
            payment_method: req.val.payment_method
        });
        if(payment.status !== "succeeded"){
            return res.status(402).send("The payment was declined, the order is still pending");
        }
        if(!await orderModel.changePendingOrderStatus(prisma, {id: order.id, status: "PAID", total: order.total})){
            return res.status(409).send("Only a pending order can be paid");
        }
        res.send(await orderModel.readOrderById(prisma, {id: order.id}));
    } catch (err) {
        sendError(req, res, err);
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const order = await orderModel.readOrderById(prisma, {id: req.val.id});
        if(!order){
            return res.sendStatus(404);
        }
        if(order.user_id !== req.session.id && req.session.role !== "ADMIN"){
            return res.sendStatus(403);
        }
        const cancelled = await prisma.$transaction(tx => cancelPendingOrder(tx, {id: order.id}));
        if(!cancelled){
            return res.status(409).send("Only a pending order can be cancelled");
        }
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};
