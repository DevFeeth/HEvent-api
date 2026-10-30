/**
 * @swagger
 * /ticket-types/{ticket_type_id}:
 *     patch:
 *         summary: Update a ticket type (event owner organizer or administrator)
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
 *                 description: Ticket type updated
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
 *         summary: Delete a ticket type (event owner organizer or administrator)
 *         description: Not possible if tickets of this type have been sold
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - TicketType
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             204:
 *                 description: Ticket type deleted
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
