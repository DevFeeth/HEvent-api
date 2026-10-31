/**
 * @swagger
 * components:
 *     responses:
 *         MustBeAdmin:
 *             description: The action must be performed by an administrator
 *             content:
 *                 text/plain:
 *                     schema:
 *                         type: string
 *                         example: Forbidden
 *         MustBeOrganizer:
 *             description: The action must be performed by the organizer who owns the event (or an administrator)
 *             content:
 *                 text/plain:
 *                     schema:
 *                         type: string
 *                         example: Forbidden
 */

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