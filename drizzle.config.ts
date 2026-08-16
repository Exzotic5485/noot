import { defineConfig } from "drizzle-kit";
import { ENV } from "./src/env";

export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema.ts",
    dialect: "sqlite",
    dbCredentials: {
        url: ENV.DATABASE_FILE,
    },
});
