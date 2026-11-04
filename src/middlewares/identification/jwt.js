/**
 * @swagger
 * components:
 *     securitySchemes:
 *         bearerAuth:
 *             type: http
 *             scheme: bearer
 *             bearerFormat: JWT
 *     responses:
 *         UnauthorizedError:
 *             description: Missing, invalid or expired token
 *             content:
 *                 text/plain:
 *                     schema:
 *                         type: string
 *                         example: Unauthorized
 */

import jwt from "jsonwebtoken";
import prisma from "../../database/database.js";
import * as userModel from "../../models/user.js";
import {sendError} from "../../utils/sendError.js";

const MAX_ID = 2147483647;

const readPayload = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return null;
    }
};

const openSession = async (header) => {
    const id = header?.startsWith("Bearer ") ? readPayload(header.slice(7))?.id : undefined;
    if(!Number.isInteger(id) || id < 1 || id > MAX_ID){
        return null;
    }
    const user = await userModel.readUserSession(prisma, {id});
    return user?.is_active ? {id: user.id, role: user.role_name} : null;
};

export const checkJWT = async (req, res, next) => {
    let session;
    try {
        session = await openSession(req.get("Authorization"));
    } catch (err) {
        return sendError(req, res, err);
    }
    if(!session){
        return res.sendStatus(401);
    }
    req.session = session;
    next();
};

export const optionalJWT = async (req, res, next) => {
    if(!req.get("Authorization")){
        return next();
    }
    return checkJWT(req, res, next);
};