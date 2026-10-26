export const readUsers = async (db, {role_name, is_active} = {}) => {
    return await db.users.findMany({
        where: {
            role_name: role_name,
            is_active: is_active
        },
        omit: {
            password_hash: true
        }
    });
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

export const readUserByEmail = async (db, {email}) => {
    return await db.users.findUnique({
        where: {email}
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
