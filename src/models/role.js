export const readRoles = async (db) => {
    return await db.role.findMany();
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
            name: name
        },
        data: {
            label: label
        }
    });
};

export const deleteRole = async (db, {name}) => {
    return await db.role.delete({
        where: {
            name: name
        }
    });
};
