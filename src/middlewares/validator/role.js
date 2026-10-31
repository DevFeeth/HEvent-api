/**
 * @swagger
 * components:
 *     parameters:
 *         RoleName:
 *             in: path
 *             name: name
 *             required: true
 *             description: Role name, converted to uppercase
 *             schema:
 *                 type: string
 *                 pattern: '^[A-Za-z0-9_-]+$'
 *                 minLength: 1
 *                 maxLength: 25
 *                 example: ORGANIZER
 *     schemas:
 *         RoleToAdd:
 *             type: object
 *             properties:
 *                 name:
 *                     description: Converti en majuscule
 *                     type: string
 *                     pattern: '^[A-Za-z0-9_-]+$'
 *                     minLength: 1
 *                     maxLength: 25
 *                     example: ORGANIZER
 *                 label:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                     example: Organisateur
 *             required:
 *                 - name
 *                 - label
 *         RoleToUpdate:
 *             type: object
 *             properties:
 *                 label:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                     example: Organisateur
 *             required:
 *                 - label
 */
import vine from "@vinejs/vine";

const name = () => vine.string().trim().toUpperCase().regex(/^[A-Z0-9_-]+$/).minLength(1).maxLength(25);

const updateOrAddRoleValidator = vine.create(vine.object({
    name: name(),
    label: vine.string().trim().minLength(1).maxLength(50),
}));

const nameValidator = vine.create(vine.object({
    name: name()
}));

export const addRole = async (req, res, next) => {
    try {
        req.val = await updateOrAddRoleValidator.validate(req.body ?? {});
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const updateRole = async (req, res, next) => {
    try {
        req.val = await updateOrAddRoleValidator.validate({...req.body, name: req.params.name});
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const nameRole = async (req, res, next) => {
    try {
        req.val = await nameValidator.validate(req.params);
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
}