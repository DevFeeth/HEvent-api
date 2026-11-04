const details = {
    promo_code: {
        select: {
            code: true
        }
    },
    ticket: {
        include: {
            ticket_type: {
                select: {
                    id: true,
                    name: true,
                    event: {
                        select: {
                            id: true,
                            name: true,
                            status: true
                        }
                    }
                }
            }
        },
        orderBy: {
            id: "asc"
        }
    }
};

export const readOrderById = async (db, {id}) => {
    return await db.orders.findUnique({
        where: {
            id: parseInt(id)
        },
        include: details
    });
};

export const readOrdersByUserId = async (db, {user_id}) => {
    return await db.orders.findMany({
        where: {
            user_id: parseInt(user_id)
        },
        include: details,
        orderBy: {
            id: "desc"
        }
    });
};

export const createOrder = async (db, {subtotal, discount_amount, status, user_id, promo_code_id}) => {
    const {id} = await db.orders.create({
        data: {
            subtotal,
            discount_amount,
            status,
            user_id,
            promo_code_id
        },
        select: {
            id: true
        }
    });
    return id;
};

export const lockOrderById = async (db, {id}) => {
    await db.$queryRaw`SELECT id FROM orders WHERE id = ${parseInt(id)} FOR UPDATE`;
    return await db.orders.findUnique({
        where: {
            id: parseInt(id)
        }
    });
};

export const readExpiredOrderIds = async (db, {before}) => {
    const orders = await db.orders.findMany({
        where: {
            status: "PENDING",
            created_at: {lt: before}
        },
        select: {
            id: true
        }
    });
    return orders.map(order => order.id);
};

export const updatePendingOrderAmounts = async (db, {id, subtotal, discount_amount, status}) => {
    return await db.orders.updateMany({
        where: {
            id: parseInt(id),
            status: "PENDING"
        },
        data: {
            subtotal,
            discount_amount,
            status
        }
    });
};

// With a total, the update fails if the amount changed after it was read
export const changePendingOrderStatus = async (db, {id, status, total}) => {
    const {count} = await db.orders.updateMany({
        where: {
            id: parseInt(id),
            status: "PENDING",
            ...(total !== undefined && {total})
        },
        data: {
            status
        }
    });
    return count === 1;
};
