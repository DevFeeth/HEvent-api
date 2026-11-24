// Réinitialise la base de données : supprime toutes les tables, puis exécute src/scripts/SQL/hEvent.sql
// (création des tables + données de démonstration). Utilise DATABASE_URL du fichier .env.
// Lancement : npm run initDB
import "dotenv/config";
import {readFile} from "node:fs/promises";
import pg from "pg";

const sqlPath = new URL("../SQL/hEvent.sql", import.meta.url);
const client = new pg.Client({connectionString: process.env.DATABASE_URL});

try {
    const sql = await readFile(sqlPath, "utf8");
    await client.connect();
    // Repart d'un schéma vide : tables, types et données précédents sont supprimés
    await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    await client.query(sql);
    console.log("Base de données initialisée.");
} catch (err) {
    console.error("Échec de l'initialisation de la base de données :", err.message);
    process.exitCode = 1;
} finally {
    await client.end();
}
