import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
    try {
        console.log("🔍 Testing PostgreSQL connection...");
        console.log("Connection string:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));

        const client = await pool.connect();
        console.log("✅ Connected to database successfully!");

        const result = await client.query("SELECT current_database(), current_user");
        console.log("Database:", result.rows[0].current_database);
        console.log("User:", result.rows[0].current_user);

        client.release();
        await pool.end();

        process.exit(0);
    } catch (error) {
        console.error("❌ Connection failed:");
        console.error(error);
        process.exit(1);
    }
}

testConnection();
