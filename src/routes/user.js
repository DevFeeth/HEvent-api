import Router from 'express';
import { checkJWT } from "../middlewares/identification/jwt.js";
import * as mustBe from "../middlewares/authorization/mustBe.js";
import * as userValidator from "../middlewares/validator/user.js";
import * as paramsValidator from "../middlewares/validator/params.js";
import {
    getUsers,
    getUserById,
    getMe,
    registerUser,
    loginUser,
    updateUser,
    updateMe,
    deleteUser,
} from "../controllers/userORM.js";
import {getMyEvents} from "../controllers/eventORM.js";

const router = Router();

router.get("/", checkJWT, mustBe.admin, userValidator.filterUsers, getUsers);
router.get("/me", checkJWT, getMe);
router.get("/me/events", checkJWT, mustBe.organizer, getMyEvents);
router.get("/:id", checkJWT, mustBe.admin, paramsValidator.id, getUserById);

router.post("/", userValidator.registerUser, registerUser);
router.post("/login", userValidator.loginUser, loginUser);

router.patch("/me", checkJWT, userValidator.updateMe, updateMe);
router.patch("/:id", checkJWT, mustBe.admin, userValidator.updateUser, updateUser);

router.delete("/:id", checkJWT, mustBe.admin, paramsValidator.id, deleteUser);

export default router;