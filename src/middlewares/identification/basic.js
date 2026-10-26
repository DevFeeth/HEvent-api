import bcrypt from "bcryptjs";
import prisma from "../../database/databaseORM.js";
import {readUserByEmail} from "../../models/user.js";

export const authBasic = async (req, res, next) => {
    try {
        const header = req.get("Authorization");
        if(header?.startsWith("Basic ")){
            const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
            const separated = decoded.indexOf(":");
            const email = decoded.slice(0, separated).toLowerCase();
            const password = decoded.slice(separated + 1);

            const user = await readUserByEmail(prisma, {email});
            if(user && user.is_active && await bcrypt.compare(password, user.password_hash)){
                req.session = {id: user.id, role: user.role_name};
                next();
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(401);
        }
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
};