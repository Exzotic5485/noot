import * as v from "valibot";

const EnvSchema = v.object({
    BOT_TOKEN: v.string(),
    DATABASE_FILE: v.optional(v.string(), "database.sqlite"),
    OWNER_ID: v.string(),
});

export const ENV = v.parse(EnvSchema, process.env);
