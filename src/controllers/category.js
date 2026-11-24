/**
 * @swagger
 * components:
 *     schemas:
 *         Category:
 *             type: object
 *             properties:
 *                 name:
 *                     type: string
 *                     example: CONCERT
 *                 label:
 *                     type: string
 *                     example: Concert
 *                 event_count:
 *                     type: integer
 *                     description: Number of events in this category (in the list only)
 *                     example: 9
 *     responses:
 *         CategoryAdded:
 *             description: Category created, its name is returned
 *             content:
 *                 application/json:
 *                     schema:
 *                         type: object
 *                         properties:
 *                             name:
 *                                 type: string
 *                                 example: CONCERT
 */

import * as categoryModel from "../models/category.js";
import prisma from "../database/database.js";
import {sendError} from "../utils/sendError.js";

export const getCategories = async (req, res) => {
    try {
        const {items, total} = await categoryModel.readCategories(prisma, req.val);
        res.set("X-Total-Count", total).send(items);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const addCategory = async (req, res) => {
    try {
        const name = await categoryModel.createCategory(prisma, req.val);
        res.status(201).json({name});
    } catch (err) {
        sendError(req, res, err);
    }
};

export const updateCategory = async (req, res) => {
    try {
        await categoryModel.updateCategory(prisma, req.val);
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const deleteCategory = async (req, res) => {
    try {
        await categoryModel.deleteCategory(prisma, req.val);
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};