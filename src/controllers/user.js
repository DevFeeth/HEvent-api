/**
 * @swagger
 * components:
 *     schemas:
 *         User:
 *             type: object
 *             properties:
 *                 id:
 *                     type: integer
 *                 email:
 *                     type: string
 *                     format: email
 *                 first_name:
 *                     type: string
 *                 last_name:
 *                     type: string
 *                 address:
 *                     type: string
 *                     nullable: true
 *                 postal_code:
 *                     type: string
 *                     nullable: true
 *                 city:
 *                     type: string
 *                     nullable: true
 *                 is_active:
 *                     type: boolean
 *                 created_at:
 *                     type: string
 *                     format: date-time
 *                 role_name:
 *                     type: string
 *                     enum: [USER, ORGANIZER, ADMIN]
 *     responses:
 *         Token:
 *             description: Login successful, the JWT is valid for 24 hours
 *             content:
 *                 application/json:
 *                     schema:
 *                         type: object
 *                         properties:
 *                             token:
 *                                 type: string
 *                                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

import prisma from "../database/database.js";
import * as userModel from "../models/user.js";
import jwt from "jsonwebtoken";
import {hash, verify} from "../utils/hash.js";
import {sendError} from "../utils/sendError.js";

export const getUsers = async (req, res) => {
    try {
        const filters = req.val;
        const users = await userModel.readUsers(prisma, filters);
        res.send(users);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await userModel.readUserById(prisma, {id: req.val.id});
        if(user){
            res.send(user);
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        sendError(req, res, err);
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await userModel.readUserById(prisma, {id: req.session.id});
        if (user){
            res.send(user);
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        sendError(req, res, err);
    }
};

export const registerUser = async (req, res) => {
    try {
        const {password, ...fields} = req.val;
        const id = await userModel.createUser(prisma, {
            ...fields,
            password_hash: await hash(password)
        });
        res.status(201).json({id});
    } catch (err) {
        sendError(req, res, err);
    }
};

export const updateUser = async (req, res) => {
    try {
        const {password, ...fields} = req.val;
        if (password) {
            fields.password_hash = await hash(password);
        }
        await userModel.updateUser(prisma, fields);
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const updateMe = async (req, res) => {
    try {
        const {password, ...fields} = req.val;
        if(password){
            fields.password_hash = await hash(password);
        }
        await userModel.updateUser(prisma, {...fields, id: req.session.id});
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const deleteUser = async (req, res) => {
    try {
        await userModel.deleteUser(prisma, {id: req.val.id});
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const loginUser = async (req, res) => {
    try {
        const user = await userModel.readUserByEmail(prisma, {email: req.val.email});
        if (user && user.is_active && await verify(user.password_hash, req.val.password)) {
            const token = jwt.sign(
                {id: user.id, role: user.role_name},
                process.env.JWT_SECRET,
                {expiresIn: "24h"}
            );
            res.send({token});
        } else {
            res.sendStatus(401);
        }
    } catch (err) {
        sendError(req, res, err);
    }
}
