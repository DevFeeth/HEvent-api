/**
 * @swagger
 * /users:
 *     get:
 *         summary: Récupérer la liste des utilisateurs (pour les admins)
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
 *               description: Permet de filtrer par rôle
 *             - in: query
 *               name: is_active
 *               schema:
 *                   type: boolean
 *               description: Permet de filtrer les comptes activés/désactivés
 *         responses:
 *             200:
 *                 description: La liste des utilisateurs (sans le hash du mot de passe)
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
 *         summary: Inscription (crée un compte USER)
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
 *         summary: Connexion => renvoie un JWT valable 24 heures
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
 *                 description: Email ou mot de passe incorrect, ou compte désactivé
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
 *         summary: Profil de l'utilisateur connecté
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - User
 *         responses:
 *             200:
 *                 description: Les informations de profil (sans le hash du mot de passe)
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
 *         summary: Modifier son profil ou son mot de passe
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
 *                 description: Profil modifié
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
 *         summary: Événements de l'organisateur connecté, brouillons compris
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - User
 *             - Event
 *         responses:
 *             200:
 *                 description: La liste de ses événements
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
 * /users/{id}:
 *     get:
 *         summary: Détail d'un utilisateur (seulement pour les admins)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - User
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             200:
 *                 description: Les informations de l'utilisateur (sans le hash du mot de passe)
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
 *         summary: Modifier un utilisateur, rôle et activation compris (seulement pour les admins)
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
 *                 description: Utilisateur modifié
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
 *         summary: Supprimer un utilisateur (seulement pour les admins)
 *         description: Impossible s'il a des commandes, des billets ou des événements; (dans ce cas la => plutôt le désactiver)
 *         security:
 *             - bearerAuth: []
 *         tags:
 *             - User
 *         parameters:
 *             - $ref: '#/components/parameters/Id'
 *         responses:
 *             204:
 *                 description: Utilisateur supprimé
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
} from "../controllers/userORM.js";
import {getMyEvents} from "../controllers/eventORM.js";

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