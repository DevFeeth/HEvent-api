/**
 * @swagger
 * /events:
 *     get:
 *         summary: Récupére la liste des événements
 *         description: Les brouillons (status = DRAFT) ne sont visibles que par l'administrateur
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Event
 *         parameters:
 *             - in: query
 *               name: status
 *               description: Un ou plusieurs statuts, séparés par des virgules (ex. PUBLISHED,CANCELLED)
 *               style: form
 *               explode: false
 *               schema:
 *                   type: array
 *                   items:
 *                       type: string
 *                       enum: [DRAFT, PUBLISHED, CANCELLED, FINISHED]
 *             - in: query
 *               name: category_name
 *               description: Permet de filtrer par catégorie
 *               schema:
 *                   type: string
 *                   example: party
 *             - in: query
 *               name: organizer_id
 *               description: Permet de filtrer par organisateur
 *               schema:
 *                   type: integer
 *                   minimum: 1
 *         responses:
 *             200:
 *                 description: La liste des événements
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
 *         summary: Créer un événement (seulement pour les organisateurs (admins compris))
 *         description: L'organisateur est l'utilisateur connecté
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
 *         summary: Récupére les détails d'un événement
 *         description: Un brouillon n'est visible que par son organisateur ou un administrateur
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Event
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             200:
 *                 description: Les détails de l'événement
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
 *         summary: Modifier un événement (organisateur propriétaire ou administrateur)
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
 *                 description: Événement modifié
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
 *         summary: Supprimer un événement (organisateur propriétaire ou administrateur)
 *         description: Impossible s'il a des billets vendus
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Event
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             204:
 *                 description: Événement supprimé
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
 *         summary: Récupére les types de billets d'un événement (triés par prix croissant)
 *         description: Ceux d'un brouillon ne sont visibles que par son organisateur ou un administrateur
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - TicketType
 *         parameters:
 *             - $ref: '#/components/parameters/EventId'
 *         responses:
 *             200:
 *                 description: La liste des types de billets
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
 *         summary: Créer un type de billet (organisateur propriétaire de l'événement ou administrateur)
 *         security:
 *             - bearerAuth: []
 *         tags:
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

router.get("/:event_id/ticket-types", checkJWT, ticketTypeValidator.eventId, getTicketTypeByEvent);
router.post("/:event_id/ticket-types", checkJWT, mustBe.organizer, ticketTypeValidator.addTicketType, addTicketType);

export default router;