export const readEvents = async (db, {status, category_name, organizer_id} = {}) => {
    return await db.events.findMany({
        where: {
            status: Array.isArray(status) ? {in: status} : status,
            category_name,
            organizer_id
        }
    });
};

export const readEventById = async (db, {id}) => {
    return await db.events.findUnique({
        where: {
            id: parseInt(id)
        },
    });
};

export const createEvent = async (db, {name, description, image_url, start_date, start_time, end_date, end_time, latitude, longitude, capacity, status, category_name, organizer_id}) => {
    const {id} = await db.events.create({
        data: {
            name,
            description,
            image_url,
            start_date,
            start_time,
            end_date,
            end_time,
            latitude,
            longitude,
            capacity,
            status,
            category_name,
            organizer_id,
        },
        select: {
            id: true
        }
    });
    return id;
};

export const updateEvent = async (db, {id, ...fields}) => {
    if(Object.values(fields).every(value => value === undefined)){
        throw new Error("No field given");
    }
    return await db.events.update({
        where: {
            id: parseInt(id)
        },
        data: fields
    });
};

export const deleteEvent = async (db, {id}) => {
    return await db.events.delete({
        where: {
            id: parseInt(id)
        }
    });
};
