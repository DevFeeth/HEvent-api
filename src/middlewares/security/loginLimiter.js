// Protection contre la force brute : après MAX_FAILURES échecs de connexion pour une même adresse IP
// et un même email, les tentatives sont refusées (429) pendant WINDOW_MS. Une connexion réussie remet le compteur à zéro.
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

// shortcut: compteurs en mémoire (perdus au redémarrage, non partagés entre plusieurs instances) ; Redis si l'API est dupliquée
const failures = new Map();

export const loginLimiter = (req, res, next) => {
    const key = `${req.ip}|${String(req.body?.email ?? "").trim().toLowerCase()}`;
    const now = Date.now();
    const entry = failures.get(key);

    if(entry && entry.resetAt <= now){
        failures.delete(key);
    } else if(entry && entry.count >= MAX_FAILURES){
        res.set("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
        return res.status(429).send("Too many failed login attempts, try again later");
    }

    // Le résultat n'est connu qu'une fois la réponse envoyée
    res.on("finish", () => {
        if(res.statusCode === 401){
            const current = failures.get(key) ?? {count: 0, resetAt: Date.now() + WINDOW_MS};
            failures.set(key, {...current, count: current.count + 1});
        } else if(res.statusCode === 200){
            failures.delete(key);
        }
    });
    next();
};
