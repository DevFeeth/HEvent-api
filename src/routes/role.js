/**
 * @swagger
 * /roles:
 *     get:
 *         summary: Récupére la liste des rôles (seulement pour les admins)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Role
 *         responses:
 *             200:
 *                 description: La liste des rôles
 *                 content:
 *                     application/json:
 *                         schema:
 *                             type: array
 *                             items:
 *                                 $ref: '#/components/schemas/Role'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeAdmin'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 *     post:
 *         summary: Créer un rôle (seulement pour les admins)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Role
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/RoleToAdd'
 *         responses:
 *             201:
 *                 $ref: '#/components/responses/RoleAdded'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeAdmin'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /roles/{name}:
 *     patch:
 *         summary: Modifier un rôle (seulement pour les admins)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Role
 *         parameters:
 *             - $ref: '#/components/parameters/RoleName'
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/RoleToUpdate'
 *         responses:
 *             204:
 *                 description: Rôle modifié
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
 *         summary: Supprimer un rôle (seulement pour les admins)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Role
 *         parameters:
 *             - $ref: '#/components/parameters/RoleName'
 *         responses:
 *             204:
 *                 description: Rôle supprimé
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

import Router from 'express';
import { checkJWT } from "../middlewares/identification/jwt.js";
import * as mustBe from "../middlewares/authorization/mustBe.js";
import * as roleValidator from "../middlewares/validator/role.js";
import {
    getRoles,
    updateRole,
    deleteRole,
    addRole,
} from "../controllers/role.js";

const router = Router();

router.get("/", checkJWT, mustBe.admin, getRoles);
router.post("/", checkJWT, mustBe.admin, roleValidator.addRole, addRole);
router.patch("/:name", checkJWT, mustBe.admin, roleValidator.updateRole, updateRole);
router.delete("/:name", checkJWT, mustBe.admin, roleValidator.nameRole, deleteRole);

export default router;