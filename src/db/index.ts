import { ENV } from "../env";
import { drizzle } from "drizzle-orm/bun-sqlite";

const db = drizzle(ENV.DATABASE_FILE);

export { db };
