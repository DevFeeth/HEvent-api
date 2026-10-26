import prisma from "../database/databaseORM.js";
import * as userModel from "../models/user.js";
import bcrypt from "bcryptjs";

export const getUsers = async (req, res) => {
    try {
        const users = await userModel.readUsers(prisma, req.val);
        res.send(users);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
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
        console.error(err);
        res.sendStatus(500);
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
        console.error(err);
        res.sendStatus(500);
    }
};

export const addUser = async (req, res) => {
    try {
        const {password, ...fields} = req.val;
        const id = await userModel.createUser(prisma, {
            ...fields,
            password_hash: await bcrypt.hash(password, 12)
        });
        res.status(201).json({id});
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};

export const updateUser = async (req, res) => {
    try {
        const {password, ...fields} = req.val;
        if (password) {
            fields.password_hash = await bcrypt.hash(password, 12);
        }
        await userModel.updateUser(prisma, fields);
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};

export const updateMe = async (req, res) => {
    try {
        const {password, ...fields} = req.val;
        if(password){
            fields.password_hash = await bcrypt.hash(password, 12);
        }
        await userModel.updateUser(prisma, {...fields, id: req.session.id});
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};

export const deleteUser = async (req, res) => {
    try {
        await userModel.deleteUser(prisma, {id: req.val.id});
        res.sendStatus(204);
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};
