import express from "express";
import cors from "cors";
import pinoHTTP from "pino-http";
import {logger} from "./src/utils/logger.js"
import {default as Router} from "./src/routes/index.js";

const app = express();
const port = 3001;

app.use(pinoHTTP({logger}));
app.use(cors());
app.use(express.json());
app.use("/api/v1", Router);

app.use((req, res) => {
    req.log.warn(`Bad URL: ${req.path}`);
    return res.status(404).send("Il ne s'agit pas d'une URL prise en charge par l'application");
});

app.listen(port, () => {
    logger.info(`HEvent api listening at http://localhost:${port}`);
});