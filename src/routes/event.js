import Router from 'express';
import { authBasic } from "../middlewares/identification/basic.js";
import * as mustBe from "../middlewares/authorization/mustBe.js";
import * as eventValidator from "../middlewares/validator/event.js";
import * as paramsValidator from "../middlewares/validator/params.js";
import {
    getEvents,
    getEventById,
    getMyEvents,
    addEvent,
    updateEvent,
    deleteEvent,
} from "../controllers/eventORM.js";

const router = Router();

router.get("/", authBasic, eventValidator.filterEvent, getEvents);
router.get("/me", authBasic, mustBe.organizer, getMyEvents);
router.get("/:id", authBasic, paramsValidator.id, getEventById);
router.post("/", authBasic, mustBe.organizer, eventValidator.addEvent, addEvent);
router.patch("/", authBasic, mustBe.organizer, eventValidator.updateEvent, updateEvent);
router.delete("/:id", authBasic, mustBe.organizer, paramsValidator.id, deleteEvent);

export default router;