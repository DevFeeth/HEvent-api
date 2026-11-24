// Sans limit, toute la liste est renvoyée (l'app mobile charge les listes complètes)
export const pageOf = ({page = 1, limit} = {}) => (limit ? {skip: (page - 1) * limit, take: limit} : {});

const contains = (value) => ({contains: value, mode: "insensitive"});

// Chaque mot de la recherche doit se trouver dans au moins un des champs : « olive orga » trouve Olive Orga
export const searchWhere = (search, fields) => (search
    ? {AND: search.split(/\s+/).map((word) => ({OR: fields.map((field) => field(contains(word)))}))}
    : {});
