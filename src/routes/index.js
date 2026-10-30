/**
 * @swagger
 * components:
 *     responses:
 *        Created:
 *            description: Ressource créée => son id est renvoyé
 *            content:
 *                application/json:
 *                    schema:
 *                        type: object
 *                        properties:
 *                            id:
 *                                type: integer
 *                                example: 12
 *        NotFound:
 *            description: Ressource introuvable
 *            content:
 *                text/plain:
 *                    schema:
 *                        type: string
 *                        example: Not Found
 *        ServerError:
 *            description: Erreur interne du serveur
 *            content:
 *                text/plain:
 *                    schema:
 *                        type: string
 *                        example: Internal Server Error
 *        Conflict:
 *            description: Conflit avec des données existantes (déjà utilisée ou liée à d'autres ressources)
 *            content:
 *                text/plain:
 *                    schema:
 *                        type: string
 *                        example: Cette valeur est déjà utilisée
 */

import prisma from "../database/database.js";
import {Router} from 'express';
import {default as userRouter} from "./user.js";
import {default as eventRouter} from "./event.js";
import {default as ticketTypeRouter} from "./ticketType.js";

const router = Router();

router.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.send({status: "ok", uptime: process.uptime()});
    } catch (err) {
        req.log.error(err);
        res.status(503).send({status: "error", database: "unreachable"});
    }
});

router.use("/users", userRouter);
router.use("/events", eventRouter);
router.use("/ticket-types", ticketTypeRouter);

export default router;