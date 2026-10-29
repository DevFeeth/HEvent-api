/**
 * @swagger
 * components:
 *     responses:
 *         MustBeAdmin:
 *             description: L'action doit être réalisée par un administrateur
 *             content:
 *                 text/plain:
 *                     schema:
 *                         type: string
 *                         example: Forbidden
 *         MustBeOrganizer:
 *             description: L'action doit être réalisée par l'organisateur propriétaire de l'événement (ou un administrateur)
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