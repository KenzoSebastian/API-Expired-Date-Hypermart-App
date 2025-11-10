import cron from "node-cron";
import { axiosInstance } from "../config/axios.js";

export const notifSender = () =>
  cron.schedule("* * * * *", async () => {
    try {
      const { data } = await axiosInstance.get("/notification/cronJob");
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  });
