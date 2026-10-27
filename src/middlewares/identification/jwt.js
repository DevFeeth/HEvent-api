import jwt from "jsonwebtoken";

export const checkJWT = async (req, res, next) => {
    const header = req.get("Authorization");
    if(header?.startsWith("Bearer ")){
        try {
            const {id, role} = jwt.verify(header.slice(7), process.env.JWT_SECRET);
            req.session = {id, role};
            next();
        } catch (e) {
            res.sendStatus(401);
        }
    } else {
        res.sendStatus(401);
    }
};