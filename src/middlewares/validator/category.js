/**
 * @swagger
 * components:
 *     parameters:
 *         CategoryName:
 *             in: path
 *             name: name
 *             required: true
 *             description: Category name, converted to uppercase
 *             schema:
 *                 type: string
 *                 pattern: '^[A-Za-z0-9_-]+$'
 *                 minLength: 1
 *                 maxLength: 25
 *                 example: CONCERT
 *     schemas:
 *         CategoryToAdd:
 *             type: object
 *             properties:
 *                 name:
 *                     description: Converted to uppercase
 *                     type: string
 *                     pattern: '^[A-Za-z0-9_-]+$'
 *                     minLength: 1
 *                     maxLength: 25
 *                     example: CONCERT
 *                 label:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                     example: Concert
 *             required:
 *                 - name
 *                 - label
 *         CategoryToUpdate:
 *             type: object
 *             properties:
 *                 label:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                     example: Concert
 *             required:
 *                 - label
 */
import vine from "@vinejs/vine";

const name = () => vine.string().trim().toUpperCase().regex(/^[A-Z0-9_-]+$/).minLength(1).maxLength(25);

const updateOrAddCategoryValidator = vine.create(vine.object({
    name: name(),
    label: vine.string().trim().minLength(1).maxLength(50),
}));

const nameValidator = vine.create(vine.object({
    name: name()
}));

export const addCategory = async (req, res, next) => {
    try {
        req.val = await updateOrAddCategoryValidator.validate(req.body ?? {});
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        req.val = await updateOrAddCategoryValidator.validate({...req.body, name: req.params.name});
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const nameCategory = async (req, res, next) => {
    try {
        req.val = await nameValidator.validate(req.params);
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};
