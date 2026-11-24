import {pageOf, searchWhere} from "../utils/pagination.js";

// Renvoie {items, total} ; user_count : nombre d'utilisateurs qui ont ce rôle
export const readRoles = async (db, {search, page, limit} = {}) => {
    const where = searchWhere(search, [(word) => ({name: word}), (word) => ({label: word})]);
    const [roles, total] = await Promise.all([
        db.role.findMany({
            where,
            include: {
                _count: {select: {users: true}}
            },
            orderBy: {
                name: "asc"
            },
            ...pageOf({page, limit})
        }),
        db.role.count({where})
    ]);
    return {items: roles.map(({_count, ...role}) => ({...role, user_count: _count.users})), total};
};

export const createRole = async (db, {name, label}) => {
    const role = await db.role.create({
        data: {
            name,
            label
        },
        select: {
            name: true
        }
    });
    return role.name;
};

export const updateRole = async (db, {name, label}) => {
    return await db.role.update({
        where: {
            name
        },
        data: {
            label
        }
    });
};

export const deleteRole = async (db, {name}) => {
    return await db.role.delete({
        where: {
            name
        }
    });
};
