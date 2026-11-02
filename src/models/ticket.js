export const readTicketById = async (db, {id}) => {
    return await db.ticket.findUnique({
        where: {
            id: parseInt(id)
        }
    });
};

export const readTicketsByUserId = async (db, {owner_id, upcoming = false}) => {
    return await db.ticket.findMany({
        where: {
            owner_id: parseInt(owner_id),
            ...(upcoming && {ticket_type: {event: {end_date: {gte: new Date()}}}})
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