import {Router} from 'express';
import {default as userRouter} from "./user.js";
import {default as eventRouter} from "./event.js";
const router = Router();

router.use("/user", userRouter);
router.use("/event", eventRouter);

router.use((req, res) => {
    console.error(`Bad URL: ${req.path}`);
    return res.status(404).send("Il ne s'agit pas d'une URL prise en charge par l'application");
});

export default router;