/**
 * @swagger
 * components:
 *     schemas:
 *         UserToRegister:
 *             type: object
 *             properties:
 *                 email:
 *                     type: string
 *                     format: email
 *                     maxLength: 254
 *                 first_name:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                 last_name:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                 password:
 *                     type: string
 *                     format: password
 *                     minLength: 8
 *                     maxLength: 72
 *                 address:
 *                     type: string
 *                     maxLength: 255
 *                 postal_code:
 *                     type: string
 *                     maxLength: 10
 *                 city:
 *                     type: string
 *                     maxLength: 100
 *             required:
 *                 - email
 *                 - first_name
 *                 - last_name
 *                 - password
 *         UserToLogin:
 *             type: object
 *             properties:
 *                 email:
 *                     type: string
 *                     format: email
 *                 password:
 *                     type: string
 *                     format: password
 *             required:
 *                 - email
 *                 - password
 *         MeToUpdate:
 *             type: object
 *             description: Au moins un champ est requis
 *             properties:
 *                 first_name:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                 last_name:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                 address:
 *                     type: string
 *                     maxLength: 255
 *                 postal_code:
 *                     type: string
 *                     maxLength: 10
 *                 city:
 *                     type: string
 *                     maxLength: 100
 *                 password:
 *                     type: string
 *                     format: password
 *                     minLength: 8
 *                     maxLength: 72
 *         UserToUpdate:
 *             description: Mêmes champs que MeToUpdate, + ceux réservés à l'administrateur (au moins un champ est requis)
 *             allOf:
 *                 - $ref: '#/components/schemas/MeToUpdate'
 *                 - type: object
 *                   properties:
 *                       email:
 *                           type: string
 *                           format: email
 *                           maxLength: 254
 *                       is_active:
 *                           type: boolean
 *                       role_name:
 *                           type: string
 *                           enum: [USER, ORGANIZER, ADMIN]
 */

import vine from "@vinejs/vine";

const roles = () => vine.enum(["USER", "ORGANIZER", "ADMIN"]);

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
    role_name: vine.array(roles()).optional(),
    is_active: vine.boolean().optional()
}));

const registerUserValidator = vine.create(vine.object({
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
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const filterUsers = async (req, res, next) => {
    try {
        req.val = await filterUserValidator.validate(req.query);
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const registerUser = async (req, res, next) => {
    try {
        req.val = await registerUserValidator.validate(req.body ?? {});
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        req.val = await updateUserValidator.validate({...req.body, id: req.params.id});
        if(Object.keys(req.val).length === 1){
            return res.status(400).send("Aucun champ à modifier");
        }
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const updateMe = async (req, res, next) => {
    try {
        req.val = await updateMeValidator.validate(req.body ?? {});
        if(Object.keys(req.val).length === 0){
            return res.status(400).send("Aucun champ à modifier");
        }
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};