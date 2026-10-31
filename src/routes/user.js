/**
 * @swagger
 * /users:
 *     get:
 *         summary: Get the list of users (admins only)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - User
 *         parameters:
 *             - in: query
 *               name: role_name
 *               schema:
 *                   type: string
 *                   enum: [USER, ORGANIZER, ADMIN]
 *               description: Filter by role
 *             - in: query
 *               name: is_active
 *               schema:
 *                   type: boolean
 *               description: Filter active or deactivated accounts
 *         responses:
 *             200:
 *                 description: The list of users (without the password hash)
 *                 content:
 *                     application/json:
 *                         schema:
 *                             type: array
 *                             items:
 *                                 $ref: '#/components/schemas/User'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeAdmin'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 *     post:
 *         summary: Register (creates a USER account)
 *         tags:
 *             - User
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/UserToRegister'
 *         responses:
 *             201:
 *                 $ref: '#/components/responses/Created'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             409:
 *                 $ref: '#/components/responses/Conflict'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /users/login:
 *     post:
 *         summary: Log in, returns a JWT valid for 24 hours
 *         tags:
 *             - User
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/UserToLogin'
 *         responses:
 *             200:
 *                 $ref: '#/components/responses/Token'
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 description: Wrong email or password, or deactivated account
 *                 content:
 *                     text/plain:
 *                         schema:
 *                             type: string
 *                             example: Unauthorized
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /users/me:
 *     get:
 *         summary: Profile of the logged-in user
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - User
 *         responses:
 *             200:
 *                 description: The profile information (without the password hash)
 *                 content:
 *                     application/json:
 *                         schema:
 *                             $ref: '#/components/schemas/User'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             404:
 *                 $ref: '#/components/responses/NotFound'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 *     patch:
 *         summary: Update your profile or password
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - User
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/MeToUpdate'
 *         responses:
 *             204:
 *                 description: Profile updated
 *             400:
 *                 $ref: '#/components/responses/ValidationError'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /users/me/events:
 *     get:
 *         summary: Events of the logged-in organizer, drafts included
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - User
 *             - Event
 *         responses:
 *             200:
 *                 description: The list of their events
 *                 content:
 *                     application/json:
 *                         schema:
 *                             type: array
 *                             items:
 *                                 $ref: '#/components/schemas/Event'
 *             401:
 *                 $ref: '#/components/responses/UnauthorizedError'
 *             403:
 *                 $ref: '#/components/responses/MustBeOrganizer'
 *             500:
 *                 $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /users/{user_id}:
 *     get:
 *         summary: Get user's details (admins only)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - User
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             200:
 *                 description: The user's information (without the password hash)
 *                 content:
 *                     application/json:
 *                         schema:
 *                             $ref: '#/components/schemas/User'
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
 *     patch:
 *         summary: Update a user, including role and activation (admins only)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - User
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         requestBody:
 *             required: true
 *             content:
 *                 application/json:
 *                     schema:
 *                         $ref: '#/components/schemas/UserToUpdate'
 *         responses:
 *             204:
 *                 description: User updated
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
 *     delete:
 *         summary: Delete a user (admins only)
 *         description: Not possible if they have orders, tickets or events (deactivate the account instead)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - User
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             204:
 *                 description: User deleted
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
import * as userValidator from "../middlewares/validator/user.js";
import * as paramsValidator from "../middlewares/validator/params.js";
import {
    getUsers,
    getUserById,
    getMe,
    registerUser,
    loginUser,
    updateUser,
    updateMe,
    deleteUser,
} from "../controllers/user.js";
import {getMyEvents} from "../controllers/event.js";

const router = Router();

router.get("/", checkJWT, mustBe.admin, userValidator.filterUsers, getUsers);
router.get("/me", checkJWT, getMe);
router.get("/me/events", checkJWT, mustBe.organizer, getMyEvents);
router.get("/:id", checkJWT, mustBe.admin, paramsValidator.id, getUserById);

router.post("/", userValidator.registerUser, registerUser);
router.post("/login", userValidator.loginUser, loginUser);

router.patch("/me", checkJWT, userValidator.updateMe, updateMe);
router.patch("/:id", checkJWT, mustBe.admin, userValidator.updateUser, updateUser);

router.delete("/:id", checkJWT, mustBe.admin, paramsValidator.id, deleteUser);

export default router;