import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  EXPO_TOKEN: process.env.EXPO_TOKEN,
  NODE_ENV: process.env.NODE_ENV || "production",
};
