/**
 * @swagger
 * /events:
 *     get:
 *         summary: Get the list of events
 *         description: Drafts (status = DRAFT) are only visible to administrators
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Event
 *         parameters:
 *             - in: query
 *               name: status
 *               description: One or more statuses, comma-separated (e.g. PUBLISHED,CANCELLED)
 *               style: form
 *               explode: false
 *               schema:
 *                   type: array
 *                   items:
 *                       type: string
 *                       enum: [DRAFT, PUBLISHED, CANCELLED, FINISHED]
 *             - in: query
 *               name: category_name
 *               description: Filter by category
 *               schema:
 *                   type: string
 *                   example: party
 *             - in: query
 *               name: organizer_id
 *               description: Filter by organizer
 *               schema:
 *                   type: integer
 *                   minimum: 1
 *         responses:
 *             200:
 *                 description: The list of events
 *                 content:
 *                     application/json:
 *                         schema:
 *                             type: array
 *                             items:
 *                                 $ref: '#/components/schemas/Event'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 *     post:
 *         summary: Create an event (organizers only, admins included)
 *         description: The organizer is the logged-in user
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Event
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/EventToAdd'
 *         responses:
 *             201:
 *                 $ref: '#/components/responses/Created'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeOrganizer'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /events/{id}:
 *     get:
 *         summary: Get the details of an event
 *         description: A draft is only visible to its organizer or an administrator
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Event
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             200:
 *                 description: The event details
 *                 content:
 *                     application/json:
 *                         schema:
 *                             $ref: '#/components/schemas/Event'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             409:
 *                 $ref: '#/components/responses/Conflict'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 *     patch:
 *         summary: Update an event (owner organizer or administrator)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Event
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/EventToUpdate'
 *         responses:
 *             204:
 *                 description: Event updated
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeOrganizer'
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 *     delete:
 *         summary: Delete an event (owner organizer or administrator)
 *         description: Not possible if it has sold tickets
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Event
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             204:
 *                 description: Event deleted
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

/**
 * @swagger
 * /events/{event_id}/ticket-types:
 *     get:
 *         summary: Get the ticket types of an event (sorted by ascending price)
 *         description: Those of a draft are only visible to its organizer or an administrator
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Event
 *             - TicketType
 *         parameters:
 *             - $ref: '#/components/parameters/EventId'
 *         responses:
 *             200:
 *                 description: The list of ticket types
 *                 content:
 *                     application/json:
 *                         schema:
 *                             type: array
 *                             items:
 *                                 $ref: '#/components/schemas/TicketType'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 *     post:
 *         summary: Create a ticket type (event owner organizer or administrator)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Event
 *             - TicketType
 *         parameters:
 *             - $ref: '#/components/parameters/EventId'
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/TicketTypeToAdd'
 *         responses:
 *             201:
 *                 $ref: '#/components/responses/Created'
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
import * as eventValidator from "../middlewares/validator/event.js";
import * as paramsValidator from "../middlewares/validator/params.js";
import * as ticketTypeValidator from "../middlewares/validator/ticketType.js";
import {
    getEvents,
    getEventById,
    addEvent,
    updateEvent,
    deleteEvent,
} from "../controllers/event.js";
import {
    getTicketTypeByEvent,
    addTicketType,
} from "../controllers/ticketType.js";

const router = Router();

router.get("/", checkJWT, eventValidator.filterEvent, getEvents);
router.get("/:id", checkJWT, paramsValidator.id, getEventById);

router.post("/", checkJWT, mustBe.organizer, eventValidator.addEvent, addEvent);
router.patch("/:id", checkJWT, mustBe.organizer, eventValidator.updateEvent, updateEvent);

router.delete("/:id", checkJWT, mustBe.organizer, paramsValidator.id, deleteEvent);

router.get("/:id/ticket-types", checkJWT, paramsValidator.id, getTicketTypeByEvent);
router.post("/:id/ticket-types", checkJWT, mustBe.organizer, ticketTypeValidator.addTicketType, addTicketType);

export default router;