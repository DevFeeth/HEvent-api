export const readPromoCodeById = async (db, {id}) => {
    return await db.promo_code.findUnique({
        where: {
            id: parseInt(id)
        }
    });
};

export const readPromoCodeByEventId = async (db, {event_id}) => {
    return await db.promo_code.findMany({
        where: {
            event_id: parseInt(event_id)
        },
        orderBy: [
            {is_active: "desc"},
            {end_at: "asc"},
            {code: "asc"}
        ]
    });
};
export const lockPromoCodeByCode = async (db, {code}) => {
    await db.$queryRaw`SELECT id FROM promo_code WHERE code = ${code} FOR UPDATE`;
    return await db.promo_code.findUnique({
        where: {
            code
        }
    });
};

export const countPromoCodeUses = async (db, {id}) => {
    return await db.orders.count({
        where: {
            promo_code_id: parseInt(id),
            status: {in: ["PENDING", "PAID"]}
        }
    });
};

export const createPromoCode = async (db, {code, discount_type, discount_value, start_at, end_at, max_uses, min_order_amount, is_active, event_id}) => {
    const {id} = await db.promo_code.create({
        data:{
            code,
            discount_type,
            discount_value,
            start_at,
            end_at,
            max_uses,
            min_order_amount,
            is_active,
            event_id,
        },

        select: {
            id: true
        }
    });

    return id
};

export const updatePromoCode = async (db, {id, ...fields}) => {
    if(Object.values(fields).every(value => value === undefined)){
        throw new Error("No field given");
    }
    return await db.promo_code.update({
        where: {
            id: parseInt(id)
        },
        data: fields
    });
};

export const deletePromoCode = async (db, {id}) => {
    return await db.promo_code.delete({
        where: {
            id: parseInt(id)
        }
    });
};

