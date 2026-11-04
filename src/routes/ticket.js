/**
 * @swagger
 * /tickets/scan:
 *     post:
 *         summary: Check a ticket in at the entrance (event owner organizer or administrator)
 *         description: Marks a valid ticket as used. Refused if the QR code is expired or invalid, the ticket is already used or cancelled, its order is not paid, the event is not published, or today is outside the dates of the event (Brussels time)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Ticket
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/TicketToScan'
 *         responses:
 *             200:
 *                 description: Entry granted, the ticket is returned
 *                 content:
 *                     application/json:
 *                         schema:
 *                             $ref: '#/components/schemas/TicketDetails'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeOrganizer'
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             409:
 *                 description: Entry refused
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: This ticket has already been used
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /tickets/{id}:
 *     get:
 *         summary: Get a ticket (its owner, the event owner organizer or an administrator)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Ticket
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             200:
 *                 description: The ticket, with its type, event, order status and owner
 *                 content:
 *                     application/json:
 *                         schema:
 *                             $ref: '#/components/schemas/TicketDetails'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 description: The ticket belongs to someone else
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: Forbidden
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /tickets/{id}/qr-token:
 *     get:
 *         summary: Get the temporary value to display as a QR code (ticket owner only)
 *         description: Only available during the dates of the event (Brussels time). The token expires after 30 seconds. Ask for a new one every 15 seconds and refresh the QR code
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Ticket
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             200:
 *                 description: The temporary QR code value
 *                 content:
 *                     application/json:
 *                         schema:
 *                             $ref: '#/components/schemas/TicketQrToken'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 description: The ticket belongs to someone else
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: Forbidden
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             409:
 *                 description: The ticket cannot give entry (already used, cancelled, unpaid order, event not published or outside its dates)
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: This ticket has already been used
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /tickets/{id}/cancel:
 *     post:
 *         summary: Cancel a valid ticket (event owner organizer or administrator)
 *         description: The ticket goes back on sale (available quantity of its type + 1). On a pending order, the amounts are recalculated (the order is cancelled if no ticket is left). On a paid order, the amounts are not changed and no refund is made
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Ticket
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             204:
 *                 description: Ticket cancelled
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeOrganizer'
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             409:
 *                 description: The ticket is already used or cancelled
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: Only a valid ticket can be cancelled
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

import {Router} from 'express';
import { checkJWT } from "../middlewares/identification/jwt.js";
import * as mustBe from "../middlewares/authorization/mustBe.js";
import * as ticketValidator from "../middlewares/validator/ticket.js";
import * as paramsValidator from "../middlewares/validator/params.js";
import {
    getTicketById,
    getTicketQrToken,
    scanTicket,
    cancelTicket,
} from "../controllers/ticket.js";

const router = Router();

router.get("/:id", checkJWT, paramsValidator.id, getTicketById);
router.get("/:id/qr-token", checkJWT, paramsValidator.id, getTicketQrToken);

router.post("/scan", checkJWT, mustBe.organizer, ticketValidator.scanTicket, scanTicket);
router.post("/:id/cancel", checkJWT, mustBe.organizer, paramsValidator.id, cancelTicket);

export default router;
