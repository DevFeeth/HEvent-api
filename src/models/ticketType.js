export const readTicketTypeByEvent = async (db, {event_id}) => {
    const ticketTypes = await db.ticket_type.findMany({
        where: {
            event_id: parseInt(event_id)
        },
        include: {
            _count: {
                select: {
                    ticket: {where: {status: {not: "CANCELLED"}}}
                }
            }
        },
        orderBy: {
            price: "asc"
        }
    });
    return ticketTypes.map(({_count, ...ticketType}) => ({
        ...ticketType,
        remaining_quantity: Math.max(ticketType.available_quantity - _count.ticket, 0)
    }));
};

export const readTicketTypeById = async (db, {id}) => {
    return await db.ticket_type.findUnique({
        where: {
            id: parseInt(id)
        }
    });
};

export const readTicketTypesByIds = async (db, {ids}) => {
    return await db.ticket_type.findMany({
        where: {
            id: {in: ids}
        },
        include: {
            event: true
        }
    });
};

export const createTicketType = async (db, {name, description, price, available_quantity, event_id}) => {
    const {id} = await db.ticket_type.create({
        data: {
            name,
            description,
            price,
            available_quantity,
            event_id
        },
        select: {
            id: true
        }
    });
    return id;
};

export const updateTicketType = async (db, {id, ...fields}) => {
    if(Object.values(fields).every(value => value === undefined)){
        throw new Error("No field given");
    }
    return await db.ticket_type.update({
        where: {
            id: parseInt(id)
        },
        data: fields
    });
};
export const deleteTicketType = async (db, {id}) => {
    return await db.ticket_type.delete({
        where: {
            id: parseInt(id)
        }
    });
};

