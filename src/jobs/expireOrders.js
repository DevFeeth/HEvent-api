import {logger} from "../utils/logger.js";
import {releaseExpiredOrders} from "../controllers/order.js";

const INTERVAL_IN_MS = 60 * 1000;

const expireOrders = () => releaseExpiredOrders().catch(err => logger.error(err));

export const startExpireOrdersJob = () => {
    expireOrders();
    setInterval(expireOrders, INTERVAL_IN_MS);
};
