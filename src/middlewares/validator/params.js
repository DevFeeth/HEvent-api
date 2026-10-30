/**
 * @swagger
 * components:
 *     parameters:
 *         Id:
 *             in: path
 *             name: id
 *             required: true
 *             description: Resource ID
 *             schema:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *         ValidationError:
 *             description: Invalid data or no field to update
 *             content:
 *                 application/json:
 *                     schema:
 *                         type: array
 *                         items:
 *                             type: object
 *                             properties:
 *                                 message:
 *                                     type: string
 *                                     example: The name field must be defined
 *                                 rule:
 *                                     type: string
 *                                     example: required
 *                                 field:
 *                                     type: string
 *                                     example: name
 *                 text/plain:
 *                     schema:
 *                         type: string
 *                         example: No field to update
 */

import vine from "@vinejs/vine";

const idValidator = vine.create(vine.object({
    id: vine.number().withoutDecimals().positive()
}));

export const id = async (req, res, next) => {
    try {
        req.val = await idValidator.validate(req.params);
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};