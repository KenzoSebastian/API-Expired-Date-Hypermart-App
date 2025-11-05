import axios from "axios";
import { ENV } from "./env.js";

export const axiosInstance = axios.create({
  baseURL: `${ENV.BASE_URL}${ENV.PORT}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});
