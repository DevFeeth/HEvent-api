export const readCategories = async (db) => {
    return await db.category.findMany({
        orderBy: {
            name: "asc"
        }
    });
};

export const createCategory = async (db, {name, label}) => {
    const category = await db.category.create({
        data: {
            name,
            label
        },
        select: {
            name: true
        }
    });
    return category.name;
};

export const updateCategory = async (db, {name, label}) => {
    return await db.category.update({
        where: {
            name
        },
        data: {
            label
        }
    });
};

export const deleteCategory = async (db, {name}) => {
    return await db.category.delete({
        where: {
            name
        }
    });
};
