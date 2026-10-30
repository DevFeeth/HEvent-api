/**
 * @swagger
 * /ticket-types/{id}:
 *     patch:
 *         summary: Modifier un type de billet (organisateur propriétaire de l'événement ou administrateur)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - TicketType
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/TicketTypeToUpdate'
 *         responses:
 *             204:
 *                 description: Type de billet modifié
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeOrganizer'
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             409:
 *                 $ref: '#/components/responses/Conflict'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 *     delete:
 *         summary: Supprimer un type de billet (organisateur propriétaire de l'événement ou administrateur)
 *         description: Impossible si des billets de ce type ont été vendus
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - TicketType
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             204:
 *                 description: Type de billet supprimé
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeOrganizer'
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
import * as ticketTypeValidator from "../middlewares/validator/ticketType.js";
import * as paramsValidator from "../middlewares/validator/params.js";
import {
    updateTicketType,
    deleteTicketType,
} from "../controllers/ticketType.js";

const router = Router();

router.patch("/:id", checkJWT, mustBe.organizer, ticketTypeValidator.updateTicketType, updateTicketType);
router.delete("/:id", checkJWT, mustBe.organizer, paramsValidator.id, deleteTicketType);

export default router;
