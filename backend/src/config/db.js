import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { ENV } from "./env.js";
import * as schema from "../db/schema.js";

const pool = new pg.Pool({
  connectionString: ENV.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

export const db = drizzle(pool, { schema });
