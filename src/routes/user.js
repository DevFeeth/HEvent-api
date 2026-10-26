import Router from 'express';
import { authBasic } from "../middlewares/identification/basic.js";
import * as mustBe from "../middlewares/authorization/mustBe.js";
import * as userValidator from "../middlewares/validator/user.js";
import * as paramsValidator from "../middlewares/validator/params.js";
import {
    getUsers,
    getUserById,
    getMe,
    addUser,
    updateUser,
    updateMe,
    deleteUser,
} from "../controllers/userORM.js";

const router = Router();

router.get("/", authBasic, mustBe.admin, userValidator.filterUsers, getUsers);
router.get("/me", authBasic, getMe);
router.get("/:id", authBasic, mustBe.admin, paramsValidator.id, getUserById);
router.post("/", userValidator.addUser, addUser);
router.patch("/me", authBasic, userValidator.updateMe, updateMe);
router.patch("/", authBasic, mustBe.admin, userValidator.updateUser, updateUser);
router.delete("/:id", authBasic, mustBe.admin, paramsValidator.id, deleteUser);

export default router;