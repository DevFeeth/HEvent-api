/**
 * @swagger
 * /categories:
 *     get:
 *         summary: Get the list of categories (public)
 *         tags:
 *             - Category
 *         responses:
 *             200:
 *                 description: The list of categories
 *                 content:
 *                     application/json:
 *                         schema:
 *                             type: array
 *                             items:
 *                                 $ref: '#/components/schemas/Category'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 *     post:
 *         summary: Create a category (admins only)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Category
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/CategoryToAdd'
 *         responses:
 *             201:
 *                 $ref: '#/components/responses/CategoryAdded'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeAdmin'
 *             409:
 *                 $ref: '#/components/responses/Conflict'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /categories/{name}:
 *     patch:
 *         summary: Update a category (admins only)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Category
 *         parameters:
 *             - $ref: '#/components/parameters/CategoryName'
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/CategoryToUpdate'
 *         responses:
 *             204:
 *                 description: Category updated
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeAdmin'
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 *     delete:
 *         summary: Delete a category (admins only)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Category
 *         parameters:
 *             - $ref: '#/components/parameters/CategoryName'
 *         responses:
 *             204:
 *                 description: Category deleted
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeAdmin'
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             409:
 *                 $ref: '#/components/responses/Conflict'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

import {Router} from 'express';
import {checkJWT, optionalJWT} from "../middlewares/identification/jwt.js";
import * as mustBe from "../middlewares/authorization/mustBe.js";
import * as categoryValidator from "../middlewares/validator/category.js";
import {
    getCategories,
    updateCategory,
    deleteCategory,
    addCategory,
} from "../controllers/category.js";

const router = Router();

router.get("/", optionalJWT, getCategories);
router.post("/", checkJWT, mustBe.admin, categoryValidator.addCategory, addCategory);
router.patch("/:name", checkJWT, mustBe.admin, categoryValidator.updateCategory, updateCategory);
router.delete("/:name", checkJWT, mustBe.admin, categoryValidator.nameCategory, deleteCategory);

export default router;