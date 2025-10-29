import express from "express";
import { addUser } from "../controller/userController/addUser.js";
import { updateExpoPushToken } from "../controller/userController/updateExpoPushToken.js";
import { getAllUser } from "../controller/userController/getAllUser.js";

const UserRoute = express.Router();

UserRoute.get("/", getAllUser);

UserRoute.post("/add", addUser);

UserRoute.patch("/update", updateExpoPushToken);

export default UserRoute;
