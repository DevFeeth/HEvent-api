import {default as swaggerJSDoc} from "swagger-jsdoc";
import * as fs from "node:fs";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API",
            version: "1.0.0",
        },
        servers: [
            {url: "http://localhost:3001/api"}
        ],
    },
    apis: [
        "./src/routes/**/*.js",
        "./src/controllers/**/*.js",
        "./src/middlewares/**/*.js",
    ],
};

const swaggerSpec = swaggerJSDoc(options);
fs.writeFileSync("./swagger/spec.json", JSON.stringify(swaggerSpec));