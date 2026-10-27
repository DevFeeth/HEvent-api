import vine from "@vinejs/vine";

const profile = {
    first_name: vine.string().trim().minLength(1).maxLength(50).optional(),
    last_name: vine.string().trim().minLength(1).maxLength(50).optional(),
    address: vine.string().trim().maxLength(255).optional(),
    postal_code: vine.string().trim().maxLength(10).optional(),
    city: vine.string().trim().maxLength(100).optional(),
    password: vine.string().minLength(8).maxLength(72).optional()
};

const loginValidator = vine.create(vine.object({
    email: vine.string().trim().toLowerCase().email(),
    password: vine.string()
}));

const filterUserValidator = vine.create(vine.object({
    role_name: vine.enum(["USER", "ORGANIZER", "ADMIN"]).optional(),
    is_active: vine.boolean().optional()
}));

const addUserValidator = vine.create(vine.object({
    email: vine.string().trim().toLowerCase().email().maxLength(254),
    first_name: vine.string().trim().minLength(1).maxLength(50),
    last_name: vine.string().trim().minLength(1).maxLength(50),
    password: vine.string().minLength(8).maxLength(72),
    address: vine.string().trim().maxLength(255).optional(),
    postal_code: vine.string().trim().maxLength(10).optional(),
    city: vine.string().trim().maxLength(100).optional()
}));

const updateUserValidator = vine.create(vine.object({
    id: vine.number().withoutDecimals().positive(),
    ...profile,
    email: vine.string().trim().toLowerCase().email().maxLength(254).optional(),
    is_active: vine.boolean().optional(),
    role_name: vine.enum(["USER", "ORGANIZER", "ADMIN"]).optional()
}));

const updateMeValidator = vine.create(vine.object({
    ...profile
}));

export const loginUser = async (req, res, next) => {
    try {
        req.val = await loginValidator.validate(req.body ?? {});
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};

export const filterUsers = async (req, res, next) => {
    try {
        req.val = await filterUserValidator.validate(req.query);
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};

export const registerUser = async (req, res, next) => {
    try {
        req.val = await addUserValidator.validate(req.body ?? {});
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        req.val = await updateUserValidator.validate({...req.body, id: req.params.id});
        if(Object.keys(req.val).length === 1){
            return res.status(400).send("Aucun champ à modifier");
        }
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};

export const updateMe = async (req, res, next) => {
    try {
        req.val = await updateMeValidator.validate(req.body ?? {});
        if(Object.keys(req.val).length === 0){
            return res.status(400).send("Aucun champ à modifier");
        }
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};