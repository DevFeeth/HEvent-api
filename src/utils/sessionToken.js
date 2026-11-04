import jwt from "jsonwebtoken";

export const signSessionToken = ({id, role}) => {
    return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn: "24h"});
};
