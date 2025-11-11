import express from "express";
import { sendNotification } from "../controller/notificationControllers/sendNotification.js";
import { getNotifications } from "../controller/notificationControllers/getNotification.js";
import { saveNotification } from "../controller/notificationControllers/saveNotification.js";
import { deleteNotification } from "../controller/notificationControllers/deleteNotification.js";
import { getCronJobNotifications } from "../controller/notificationControllers/getCronJobNotifications.js";
import { updateSeenNotification } from "../controller/notificationControllers/updateSeenNotification.js";

const NotificationRoute = express.Router();

NotificationRoute.get("/cronJob", getCronJobNotifications);

NotificationRoute.get("/:userId", getNotifications);

NotificationRoute.post("/send", sendNotification);

NotificationRoute.post("/save", saveNotification);

NotificationRoute.patch("/update/:id", updateSeenNotification);

NotificationRoute.delete("/delete/:id", deleteNotification);

export default NotificationRoute;
