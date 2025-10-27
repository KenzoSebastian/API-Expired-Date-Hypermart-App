import express from "express";
import { sendNotification } from "../controller/notificationControllers/sendNotification.js";

const NotificationRoute = express.Router();

NotificationRoute.post("/send", sendNotification);

export default NotificationRoute;
