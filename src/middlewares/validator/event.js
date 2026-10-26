import vine from "@vinejs/vine";

const date = () => vine.date({formats: ["YYYY-MM-DD"]})
    .transform(d => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())));

const time = () => vine.date({formats: ["HH:mm"]})
    .transform(d => new Date(Date.UTC(2000, 0, 1, d.getHours(), d.getMinutes())));

const status = () => vine.enum(["DRAFT", "PUBLISHED", "CANCELLED", "FINISHED"]);

const filterEventValidator = vine.create(vine.object({
    status: vine.array(status()).optional(),
    category_name: vine.string().trim().toUpperCase().maxLength(25).optional(),
    organizer_id: vine.number().withoutDecimals().positive().optional()
}));

const addEventValidator = vine.create(vine.object({
    name: vine.string().trim().minLength(1).maxLength(100),
    description: vine.string().trim().maxLength(1000).optional(),
    image_url: vine.string().trim().url().optional(),
    start_date: date(),
    end_date: date(),
    start_time: time(),
    end_time: time(),
    latitude: vine.number().range([-90, 90]).optional(),
    longitude: vine.number().range([-180, 180]).optional(),
    capacity: vine.number().withoutDecimals().positive(),
    status: status().optional(),
    category_name: vine.string().trim().toUpperCase().maxLength(25)
}));

const updateEventValidator = vine.create(vine.object({
    id: vine.number().withoutDecimals().positive(),
    name: vine.string().trim().minLength(1).maxLength(100).optional(),
    description: vine.string().trim().maxLength(1000).optional(),
    image_url: vine.string().trim().url().optional(),
    start_date: date().optional(),
    end_date: date().optional(),
    start_time: time().optional(),
    end_time: time().optional(),
    latitude: vine.number().range([-90, 90]).optional(),
    longitude: vine.number().range([-180, 180]).optional(),
    capacity: vine.number().withoutDecimals().positive().optional(),
    status: status().optional(),
    category_name: vine.string().trim().toUpperCase().maxLength(25).optional()
}));

export const filterEvent = async (req, res, next) => {
    try {
        const query = {...req.query};
        if(typeof query.status === "string"){
            query.status = query.status.split(",");
        }
        req.val = await filterEventValidator.validate(query);
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};

export const addEvent = async (req, res, next) => {
    try {
        req.val = await addEventValidator.validate(req.body ?? {});
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};

export const updateEvent = async (req, res, next) => {
    try {
        req.val = await updateEventValidator.validate(req.body ?? {});
        if(Object.keys(req.val).length === 1){
            return res.status(400).send("Aucun champ à modifier");
        }
        next();
    } catch (e) {
        res.status(400).send(e.messages);
    }
};
