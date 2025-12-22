
import { db } from "../server/storage";
import * as schema from "../shared/schema";

async function main() {
    console.log("Checking World Content...");
    const content = await db.select().from(schema.worldContent);
    console.log("Found", content.length, "content items:");

    content.forEach(c => {
        console.log(`- ID: ${c.id} | WorldID: ${c.worldId} | Level: ${c.level} | Title: ${c.title}`);
    });

    const worlds = await db.select().from(schema.worlds);
    console.log("\nWorlds:");
    worlds.forEach(w => {
        console.log(`- ID: ${w.id} | Name: ${w.name}`);
    });

    process.exit(0);
}

main().catch(console.error);
