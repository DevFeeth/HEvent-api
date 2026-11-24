import {today} from "../utils/eventDate.js";
import {pageOf, searchWhere} from "../utils/pagination.js";

// Renvoie {items, total} : la page demandée et le nombre total d'événements correspondants
export const readEvents = async (db, {status, category_name, organizer_id, search, page, limit} = {}) => {
    const where = {
        status: Array.isArray(status) ? {in: status} : status,
        category_name,
        organizer_id,
        ...searchWhere(search, [
            (word) => ({name: word}),
            (word) => ({category_name: word}),
            (word) => ({users: {first_name: word}}),
            (word) => ({users: {last_name: word}})
        ])
    };
    const [events, total] = await Promise.all([
        db.events.findMany({
            where,
            include: {
                users: {select: {id: true, first_name: true, last_name: true}}
            },
            orderBy: [
                {start_date: "asc"},
                {start_time: "asc"},
                {id: "asc"}
            ],
            ...pageOf({page, limit})
        }),
        db.events.count({where})
    ]);
    return {items: events.map(({users, ...event}) => ({...event, organizer: users})), total};
};

export const readUpcomingEvents = async (db, {limit = 3} = {}) => {
    return await db.events.findMany({
        where: {
            status: "PUBLISHED",
            start_date: {gte: today()}
        },
        orderBy: [
            {start_date: "asc"},
            {start_time: "asc"},
            {id: "asc"}
        ],
        take: limit
    });
};

export const readEventsByOrganizer = async (db, {organizer_id}) => {
    const [active, past] = await Promise.all([
        db.events.findMany({
            where: {
                organizer_id,
                end_date: {gte: today()}
            },
            orderBy: [
                {start_date: "asc"},
                {start_time: "asc"},
                {id: "asc"}
            ]
        }),
        db.events.findMany({
            where: {
                organizer_id,
                end_date: {lt: today()}
            },
            orderBy: [
                {start_date: "desc"},
                {start_time: "desc"},
                {id: "desc"}
            ]
        })
    ]);
    return [...active, ...past];
};

export const readEventById = async (db, {id}) => {
    return await db.events.findUnique({
        where: {
            id: parseInt(id)
        },
    });
};

export const lockEventById = async (db, {id}) => {
    await db.$queryRaw`SELECT id FROM events WHERE id = ${parseInt(id)} FOR UPDATE`;
    return await db.events.findUnique({
        where: {
            id: parseInt(id)
        }
    });
};

export const createEvent = async (db, {name, description, image_url, start_date, start_time, end_date, end_time, latitude, longitude, status, category_name, organizer_id}) => {
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
