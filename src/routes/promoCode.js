/**
 * @swagger
 * /promo-codes/{id}:
 *     patch:
 *         summary: Update a promo code (event owner organizer or administrator)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - PromoCode
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/PromoCodeToUpdate'
 *         responses:
 *             204:
 *                 description: Promo code updated
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
 *         summary: Delete a promo code (event owner organizer or administrator)
 *         description: Impossible if it has been used in an order (in that case, deactivate it instead)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - PromoCode
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             204:
 *                 description: Promo code deleted
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

import {Router} from 'express';
import { checkJWT } from "../middlewares/identification/jwt.js";
import * as mustBe from "../middlewares/authorization/mustBe.js";
import * as promoCodeValidator from "../middlewares/validator/promoCode.js";
import * as paramsValidator from "../middlewares/validator/params.js";
import {
    updatePromoCode,
    deletePromoCode,
} from "../controllers/promoCode.js";

const router = Router();

router.patch("/:id", checkJWT, mustBe.organizer, promoCodeValidator.updatePromoCode, updatePromoCode);
router.delete("/:id", checkJWT, mustBe.organizer, paramsValidator.id, deletePromoCode);

export default router;
