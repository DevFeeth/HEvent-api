/**
 * @swagger
 * components:
 *     schemas:
 *         Role:
 *             type: object
 *             properties:
 *                 name:
 *                     type: string
 *                     example: ORGANIZER
 *                 label:
 *                     type: string
 *                     example: Organisateur
 *     responses:
 *         RoleAdded:
 *             description: Role created, its name is returned
 *             content:
 *                 application/json:
 *                     schema:
 *                         type: object
 *                         properties:
 *                             name:
 *                                 type: string
 *                                 example: ORGANIZER
 */

import * as roleModel from "../models/role.js";
import prisma from "../database/database.js";
import {sendError} from "../utils/sendError.js";

const baseRole = ["ADMIN", "USER","ORGANIZER"];

export const getRoles = async (req, res) => {
    try {
        const roles = await roleModel.readRoles(prisma);
        res.send(roles);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const addRole = async (req, res) => {
    try {
        const name = await roleModel.createRole(prisma, req.val);
        res.status(201).json({name});
    } catch (err) {
        sendError(req, res, err);
    }
};

export const updateRole = async (req, res) => {
    try {
        await roleModel.updateRole(prisma, req.val);
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const deleteRole = async (req, res) => {
    try {
        if(baseRole.includes(req.val.name)){
            return res.status(409).send("Base roles cannot be deleted");
        }
        await roleModel.deleteRole(prisma, req.val);
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};