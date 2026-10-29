const statusFor = (err, method) => {
    switch(err.code){
        case "P2002":
            return [409, "Cette valeur est déjà utilisée"];
        case "P2003":
            return method === "DELETE"
                ? [409, "Suppression impossible : des données y sont liées"]
                : [400, "Référence inexistante"];
        case "P2039":
            return [400, "Données incohérentes"];
        case "P2025":
            return [404, "Ressource introuvable"];
        default:
            return [500, "Erreur interne du serveur"];
    }
};

export const sendError = (req, res, err) => {
    const [status, message] = statusFor(err, req.method);
    if(status === 500){
        req.log.error(err);
    } else {
        req.log.warn(`${status} ${err.code} : ${message}`);
    }
    res.status(status).send(message);
};