export const readRoles = async (db) => {
    return await db.role.findMany({
        orderBy: {
            name: "asc"
        }
    });
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
