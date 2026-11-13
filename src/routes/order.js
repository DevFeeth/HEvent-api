/**
 * @swagger
 * /orders:
 *     post:
 *         summary: Create an order and its tickets
 *         description: The tickets are reserved (counted as sold for their ticket type) and the order stays PENDING until it is paid. Its tickets cannot be used before that. An order with a total of 0 is PAID right away. An unpaid order is cancelled after 15 minutes and its tickets go back on sale
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Order
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/OrderToAdd'
 *         responses:
 *             201:
 *                 description: Order created
 *                 content:
 *                     application/json:
 *                         schema:
 *                             $ref: '#/components/schemas/Order'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             409:
 *                 description: Not enough tickets or places available, event not open for sale, or promo code usage limit reached
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: Not enough tickets available
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /orders/guest:
 *     post:
 *         summary: Create an account, an order and its tickets at the same time (no login needed)
 *         description: Everything is created together or nothing is. The returned JWT logs the new user in, so the order can be paid right after with POST /orders/{id}/pay
 *         tags:
 *             - Order
 *             - User
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/GuestOrderToAdd'
 *         responses:
 *             201:
 *                 description: Account and order created
 *                 content:
 *                     application/json:
 *                         schema:
 *                             type: object
 *                             properties:
 *                                 token:
 *                                     type: string
 *                                     description: JWT of the new user, valid for 24 hours
 *                                     example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                                 order:
 *                                     $ref: '#/components/schemas/Order'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             409:
 *                 description: The email is already used, not enough tickets or places available, event not open for sale, or promo code usage limit reached
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: An account already exists with this email, please log in
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /orders/{id}:
 *     get:
 *         summary: Get an order (its owner or an administrator)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Order
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             200:
 *                 description: The order and its tickets
 *                 content:
 *                     application/json:
 *                         schema:
 *                             $ref: '#/components/schemas/Order'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 description: The order belongs to someone else
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
 * /orders/{id}/pay:
 *     post:
 *         summary: Pay a pending order with a simulated Stripe payment (order owner only)
 *         description: No real payment is made. A declined card leaves the order PENDING, so it can be paid again
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Order
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/OrderToPay'
 *         responses:
 *             200:
 *                 description: Payment accepted, the paid order is returned
 *                 content:
 *                     application/json:
 *                         schema:
 *                             $ref: '#/components/schemas/Order'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             402:
 *                 description: Card declined
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: The payment was declined, the order is still pending
 *             403:
 *                 description: The order belongs to someone else
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: Forbidden
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             409:
 *                 description: The order is not pending, has expired or has just changed, or the event is not open for sale
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: Only a pending order can be paid
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /orders/{id}/cancel:
 *     post:
 *         summary: Cancel a pending order (its owner or an administrator)
 *         description: Its tickets are cancelled and go back on sale. A paid order cannot be cancelled
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - Order
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             204:
 *                 description: Order cancelled
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 description: The order belongs to someone else
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: Forbidden
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             409:
 *                 description: The order is not pending
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: Only a pending order can be cancelled
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

import {Router} from 'express';
import { checkJWT } from "../middlewares/identification/jwt.js";
import * as orderValidator from "../middlewares/validator/order.js";
import * as paramsValidator from "../middlewares/validator/params.js";
import {
    getOrderById,
    addOrder,
    addGuestOrder,
    payOrder,
    cancelOrder,
} from "../controllers/order.js";

const router = Router();

router.get("/:id", checkJWT, paramsValidator.id, getOrderById);

router.post("/", checkJWT, orderValidator.addOrder, addOrder);
router.post("/guest", orderValidator.addGuestOrder, addGuestOrder);
router.post("/:id/pay", checkJWT, orderValidator.payOrder, payOrder);
router.post("/:id/cancel", checkJWT, paramsValidator.id, cancelOrder);

export default router;
