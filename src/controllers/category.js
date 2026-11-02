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
        const categories = await categoryModel.readCategories(prisma);
        res.send(categories);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const getCategory = async (req, res) => {
    try {
        const category = await categoryModel.readCategoryByName(prisma, req.val);
        if(!category){
            return res.sendStatus(404);
        }
        res.send(category);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const addCategory = async (req, res) => {
    try {
        const name = await categoryModel.createCategory(prisma, {name: req.val.name, label: req.val.label});
        res.status(201).json({name});
    } catch (err) {
        sendError(req, res, err);
    }
};

export const updateCategory = async (req, res) => {
    try {
        await categoryModel.updateCategory(prisma, {name: req.val.name, label: req.val.label});
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};

export const deleteCategory = async (req, res) => {
    try {
        await categoryModel.deleteCategory(prisma, {name: req.val.name});
        res.sendStatus(204);
    } catch (err) {
        sendError(req, res, err);
    }
};
