import {pageOf, searchWhere} from "../utils/pagination.js";

// Renvoie {items, total}, les plus récents d'abord
export const readUsers = async (db, {role_name, is_active, search, page, limit} = {}) => {
    const where = {
        role_name,
        is_active,
        ...searchWhere(search, [
            (word) => ({first_name: word}),
            (word) => ({last_name: word}),
            (word) => ({email: word}),
            (word) => ({city: word})
        ])
    };
    const [items, total] = await Promise.all([
        db.users.findMany({
            where,
            omit: {
                password_hash: true
            },
            orderBy: [
                {created_at: "desc"},
                {id: "desc"}
            ],
            ...pageOf({page, limit})
        }),
        db.users.count({where})
    ]);
    return {items, total};
};

export const readUserById = async (db, {id}) => {
    return await db.users.findUnique({
        where: {
            id: parseInt(id)
        },
        omit: {
            password_hash: true
        }
    });
};

export const readUserSession = async (db, {id}) => {
    return await db.users.findUnique({
        where: {
            id: parseInt(id)
        },
        select: {
            id: true,
            role_name: true,
            is_active: true
        }
    });
};

export const readUserByEmail = async (db, {email}) => {
    return await db.users.findUnique({
        where: {
            email
        }
    });
};

export const createUser = async (db, {email, first_name, last_name, password_hash, address, postal_code, city}) => {
    const {id} = await db.users.create({
        data: {
            email,
            first_name,
            last_name,
            password_hash,
            address,
            postal_code,
            city
        },
        select: {
            id: true
        }
    });
    return id;
};

export const updateUser = async (db, {id, ...fields}) => {
    if(Object.values(fields).every(value => value === undefined)){
        throw new Error("No field given");
    }
    return await db.users.update({
        where: {
            id: parseInt(id)
        },
        data: fields
    });
};

export const deleteUser = async (db, {id}) => {
    return await db.users.delete({
        where: {
            id: parseInt(id)
        }
    });
};
