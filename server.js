import express from "express";
import cors from "cors";
import {default as Router} from "./src/routes/index.js";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use("/api", Router);

app.use((req, res) => {
    console.error(`Bad URL: ${req.path}`);
    return res.status(404).send("Il ne s'agit pas d'une URL prise en charge par l'application");
});

app.listen(port, () => {
    console.log(`HEvent api listening at http://localhost:${port}`);
});