import express from "express";
import { sendNotification } from "../controller/notificationControllers/sendNotification.js";
import { getNotifications } from "../controller/notificationControllers/getNotification.js";
import { saveNotification } from "../controller/notificationControllers/saveNotification.js";
import { deleteNotification } from "../controller/notificationControllers/deleteNotification.js";

const NotificationRoute = express.Router();

NotificationRoute.get("/:userId", getNotifications);

NotificationRoute.post("/send", sendNotification);

NotificationRoute.post("/save", saveNotification);

NotificationRoute.delete("/delete/:id", deleteNotification);

export default NotificationRoute;
