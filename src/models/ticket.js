import {randomBytes} from "node:crypto";
import {today} from "../utils/eventDate.js";

const details = {
    ticket_type: {
        include: {
            event: true
        }
    },
    orders: {
        select: {
            status: true
        }
    },
    users: {
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
        }
    }
};

export const readTicketById = async (db, {id}) => {
    return await db.ticket.findUnique({
        where: {
            id: parseInt(id)
        },
        omit: {
            public_token: true
        },
        include: details
    });
};

export const readTicketsByUserId = async (db, {owner_id, upcoming = false}) => {
    return await db.ticket.findMany({
        where: {
            owner_id: parseInt(owner_id),
            ...(upcoming && {ticket_type: {event: {end_date: {gte: today()}}}})
        },
        omit: {
            public_token: true
        },
        include: {
            ticket_type: {
                include: {
                    event: true
                }
            }
        },
        orderBy: [
            {ticket_type: {event: {start_date: "asc"}}},
            {ticket_type: {event: {start_time: "asc"}}},
            {id: "asc"}
        ]
    });
};

export const readTicketsByEventId = async (db, {event_id, status}) => {
    return await db.ticket.findMany({
        where: {
            status,
            ticket_type: {
                event_id: parseInt(event_id)
            }
        },
        omit: {
            public_token: true
        },
        include: {
            ticket_type: {
                select: {
                    id: true,
                    name: true
                }
            },
            users: details.users
        },
        orderBy: {
            id: "asc"
        }
    });
};

export const countActiveTicketsByEventId = async (db, {event_id}) => {
    return await db.ticket.count({
        where: {
            status: {not: "CANCELLED"},
            ticket_type: {
                event_id: parseInt(event_id)
            }
        }
    });
};

export const readValidTicketsByOrderId = async (db, {order_id}) => {
    return await db.ticket.findMany({
        where: {
            order_id: parseInt(order_id),
            status: "VALID"
        },
        select: {
            purchase_price: true
        }
    });
};

export const createTickets = async (db, {ticket_type_id, order_id, owner_id, purchase_price, quantity}) => {
    return await db.ticket.createManyAndReturn({
        data: Array.from({length: quantity}, () => ({
            public_token: randomBytes(32).toString("hex"),
            purchase_price,
            ticket_type_id,
            order_id,
            owner_id
        }))
    });
};

export const cancelTicketsByOrderId = async (db, {order_id}) => {
    return await db.ticket.updateManyAndReturn({
        where: {
            order_id: parseInt(order_id),
            status: "VALID"
        },
        data: {
            status: "CANCELLED"
        }
    });
};

export const markTicketAsUsed = async (db, {id}) => {
    const {count} = await db.ticket.updateMany({
        where: {
            id: parseInt(id),
            status: "VALID"
        },
        data: {
            status: "USED",
            used_at: new Date()
        }
    });
    return count === 1;
};

export const cancelTicket = async (db, {id}) => {
    const {count} = await db.ticket.updateMany({
        where: {
            id: parseInt(id),
            status: "VALID"
        },
        data: {
            status: "CANCELLED"
        }
    });
    return count === 1;
};
