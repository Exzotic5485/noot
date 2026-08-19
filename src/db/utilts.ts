import { randomUUIDv7 } from "bun";
import { text } from "drizzle-orm/sqlite-core";

export const textId = () =>
    text()
        .notNull()
        .primaryKey()
        .$defaultFn(() => randomUUIDv7());
