import {pageOf, searchWhere} from "../utils/pagination.js";

// Renvoie {items, total} ; event_count : nombre d'événements de la catégorie
export const readCategories = async (db, {search, page, limit} = {}) => {
    const where = searchWhere(search, [(word) => ({name: word}), (word) => ({label: word})]);
    const [categories, total] = await Promise.all([
        db.category.findMany({
            where,
            include: {
                _count: {select: {events: true}}
            },
            orderBy: {
                name: "asc"
            },
            ...pageOf({page, limit})
        }),
        db.category.count({where})
    ]);
    return {items: categories.map(({_count, ...category}) => ({...category, event_count: _count.events})), total};
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
