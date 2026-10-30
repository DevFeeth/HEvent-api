const statusFor = (err, method) => {
    switch(err.code){
        case "P2002":
            return [409, "This value is already in use"];
        case "P2003":
            return method === "DELETE"
                ? [409, "Cannot delete: other data is linked to it"]
                : [400, "Referenced resource does not exist"];
        case "P2039":
            return [400, "Inconsistent data"];
        case "P2025":
            return [404, "Resource not found"];
        default:
            return [500, "Internal server error"];
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