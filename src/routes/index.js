/**
 * @swagger
 * components:
 *     responses:
 *        Created:
 *            description: Resource created, its id is returned
 *            content:
 *                application/json:
 *                    schema:
 *                        type: object
 *                        properties:
 *                            id:
 *                                type: integer
 *                                example: 12
 *        NotFound:
 *            description: Resource not found
 *            content:
 *                text/plain:
 *                    schema:
 *                        type: string
 *                        example: Not Found
 *        ServerError:
 *            description: Internal server error
 *            content:
 *                text/plain:
 *                    schema:
 *                        type: string
 *                        example: Internal Server Error
 *        Conflict:
 *            description: Conflict with existing data (already in use or linked to other resources)
 *            content:
 *                text/plain:
 *                    schema:
 *                        type: string
 *                        example: This value is already in use
 */

import prisma from "../database/database.js";
import {Router} from 'express';
import {default as userRouter} from "./user.js";
import {default as eventRouter} from "./event.js";
import {default as ticketTypeRouter} from "./ticketType.js";
import {default as roleRouter} from "./role.js";

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
router.use("/roles", roleRouter);

export default router;