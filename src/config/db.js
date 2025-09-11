import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ENV } from "./env.js";
import * as schema from "../db/schema.js";

export const client = postgres(ENV.DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema });
