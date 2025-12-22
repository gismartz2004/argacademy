const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        const client = await pool.connect();
        try {
            console.log("Connected to DB. Querying world_content...");
            const res = await client.query('SELECT * FROM world_content');
            console.log("Total rows:", res.rowCount);
            if (res.rowCount === 0) {
                console.log("No content found in table.");
            }
            res.rows.forEach(row => {
                console.log(`[Content ID: ${row.id}] World ID: ${row.worldId} | Level: ${row.level} | Title: ${row.title}`);
            });

            console.log("\nQuerying worlds...");
            const worldRes = await client.query('SELECT id, name, slug FROM worlds');
            worldRes.rows.forEach(w => {
                console.log(`[World ID: ${w.id}] Name: ${w.name} (${w.slug})`);
            });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error executing query", err.stack);
    } finally {
        await pool.end();
    }
}

main();
