import Router from 'express';
import { checkJWT } from "../middlewares/identification/jwt.js";
import * as mustBe from "../middlewares/authorization/mustBe.js";
import * as eventValidator from "../middlewares/validator/event.js";
import * as paramsValidator from "../middlewares/validator/params.js";
import {
    getEvents,
    getEventById,
    addEvent,
    updateEvent,
    deleteEvent,
} from "../controllers/eventORM.js";

const router = Router();

router.get("/", checkJWT, eventValidator.filterEvent, getEvents);
router.get("/:id", checkJWT, paramsValidator.id, getEventById);

router.post("/", checkJWT, mustBe.organizer, eventValidator.addEvent, addEvent);

router.patch("/:id", checkJWT, mustBe.organizer, eventValidator.updateEvent, updateEvent);

router.delete("/:id", checkJWT, mustBe.organizer, paramsValidator.id, deleteEvent);

export default router;