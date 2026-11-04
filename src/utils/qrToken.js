import jwt from "jsonwebtoken";

export const QR_TOKEN_LIFETIME = 30;

export const signQrToken = ({ticket_id}) => {
    return jwt.sign({}, process.env.QR_SECRET, {
        subject: String(ticket_id),
        expiresIn: QR_TOKEN_LIFETIME
    });
};

export const readQrToken = ({qr_token}) => {
    const {sub} = jwt.verify(qr_token, process.env.QR_SECRET, {algorithms: ["HS256"]});
    return parseInt(sub);
};
