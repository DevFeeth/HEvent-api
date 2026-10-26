import vine from "@vinejs/vine";

const idValidator = vine.create(vine.object({
    id: vine.number().withoutDecimals().positive()
}));

export const id = async (req, res, next) => {
    try {
        req.val = await idValidator.validate(req.params);
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};