import express from "express";
import { addUser } from "../controller/userController/addUser.js";
import { updateExpoPushToken } from "../controller/userController/updateExpoPushToken.js";
import { getAllUser } from "../controller/userController/getAllUser.js";
import { getUserById } from "../controller/userController/getUserById.js";

const UserRoute = express.Router();

UserRoute.get("/", getAllUser);

UserRoute.get("/:id", getUserById);

UserRoute.post("/add", addUser);

UserRoute.patch("/update", updateExpoPushToken);

export default UserRoute;
