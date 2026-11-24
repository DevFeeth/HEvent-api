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
 *         Search:
 *             in: query
 *             name: search
 *             description: Words to search for, case-insensitive (each word must match one of the searched fields)
 *             schema:
 *                 type: string
 *                 maxLength: 100
 *                 example: olive orga
 *         Page:
 *             in: query
 *             name: page
 *             description: Page number, used with limit
 *             schema:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *         Limit:
 *             in: query
 *             name: limit
 *             description: Number of items per page. Without it, the whole list is returned
 *             schema:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 example: 10
 *     headers:
 *         TotalCount:
 *             description: Total number of items matching the filters (all pages)
 *             schema:
 *                 type: integer
 *                 example: 34
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

// Recherche et pagination des listes (?search=&page=&limit=)
export const listFields = {
    search: vine.string().trim().maxLength(100).optional(),
    page: vine.number().withoutDecimals().range([1, 2147483647]).optional(),
    limit: vine.number().withoutDecimals().range([1, 100]).optional()
};

const listValidator = vine.create(vine.object(listFields));

export const list = async (req, res, next) => {
    try {
        req.val = await listValidator.validate(req.query);
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};

export const id = async (req, res, next) => {
    try {
        req.val = await idValidator.validate(req.params);
        next();
    } catch (err) {
        res.status(400).send(err.messages);
    }
};