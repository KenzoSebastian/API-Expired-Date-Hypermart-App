import express from "express";
import { sendNotification } from "../controller/notificationControllers/sendNotification.js";
import { getNotifications } from "../controller/notificationControllers/getNotification.js";
import { saveNotification } from "../controller/notificationControllers/saveNotification.js";

const NotificationRoute = express.Router();

NotificationRoute.get("/:userId", getNotifications);

NotificationRoute.post("/send", sendNotification);

NotificationRoute.post("/save", saveNotification);

export default NotificationRoute;
