import { Database } from "bun:sqlite";
import { ENV } from "../env";

const MIGRATIONS: string[] = [
    `CREATE TABLE IF NOT EXISTS honeypot_channels (guild_id TEXT NOT NULL, channel_id TEXT NOT NULL, PRIMARY KEY (guild_id, channel_id));`,
];

export const db = new Database(ENV.DATABASE_FILE, { strict: true });

export function runMigrations() {
    db.run(
        `CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY, CREATED_AT TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`,
    );

    const applied = new Set(
        db
            .query<{ id: number }, []>("SELECT id FROM migrations")
            .all()
            .map((r) => r.id),
    );

    const run = db.transaction(() => {
        for (let id = 0; id < MIGRATIONS.length; id++) {
            if (applied.has(id)) continue;

            db.run(MIGRATIONS[id]);
            db.run(`INSERT INTO migrations (id) VALUES (?)`, [id]);
        }
    });

    console.log("Database migrations applied!");

    return run();
}
