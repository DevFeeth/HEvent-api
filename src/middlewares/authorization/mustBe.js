export const admin = (req, res, next) => {
    if(req.session?.role === "ADMIN"){
        next();
    } else {
        res.sendStatus(403);
    }
};

export const organizer = (req, res, next) => {
    if(req.session?.role === "ORGANIZER" || req.session?.role === "ADMIN"){
        next();
    } else {
        res.sendStatus(403);
    }
};