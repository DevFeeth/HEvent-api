/**
 * @swagger
 * components:
 *     parameters:
 *         Id:
 *             in: path
 *             name: id
 *             required: true
 *             description: Identifiant de la ressource
 *             schema:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *         ValidationError:
 *             description: Données invalides ou aucun champ à modifier
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
 *                         example: Aucun champ à modifier
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