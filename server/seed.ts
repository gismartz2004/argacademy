import "dotenv/config";
import { db } from "./storage";
import { skins, worlds } from "@shared/schema";

async function seed() {
    try {
        console.log("🌱 Seeding skins...");

        await db.insert(skins).values([
            {
                id: "blue",
                name: "Neon Blue",
                price: 0,
                rarity: "common",
                imageUrl: "/avatars/blue-avatar.svg"
            },
            {
                id: "red",
                name: "Cyber Red",
                price: 500,
                rarity: "rare",
                imageUrl: "/avatars/red-avatar.svg"
            },
            {
                id: "green",
                name: "Matrix Green",
                price: 500,
                rarity: "rare",
                imageUrl: "/avatars/green-avatar.svg"
            },
            {
                id: "purple",
                name: "Quantum Purple",
                price: 750,
                rarity: "epic",
                imageUrl: "/avatars/purple-avatar.svg"
            },
            {
                id: "gold",
                name: "Golden Legend",
                price: 2000,
                rarity: "legendary",
                imageUrl: "/avatars/gold-avatar.svg"
            },
            {
                id: "rainbow",
                name: "Rainbow Master",
                price: 5000,
                rarity: "legendary",
                imageUrl: "/avatars/rainbow-avatar.svg"
            }
        ]).onConflictDoNothing();

        console.log("✅ Skins seeded successfully!");

        console.log("🌱 Seeding worlds...");

        await db.insert(worlds).values([
            {
                name: "Sol",
                slug: "sun",
                description: "La fuente de energía de todo el sistema. Núcleo de fusión nuclear.",
                locked: true,
                imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2608&auto=format&fit=crop"
            },
            {
                name: "Mercurio",
                slug: "mercury",
                description: "Sector Hardware. Zona de Alta Temperatura. Fundamentos de electrónica y resistencia térmica.",
                locked: true,
                imageUrl: "https://images.unsplash.com/photo-1614730341194-75c60740a08f?q=80&w=2574&auto=format&fit=crop"
            },
            {
                name: "Venus",
                slug: "venus",
                description: "La Nube. Atmósfera densa de datos. Arquitectura de servidores y redes distribuidas.",
                locked: true,
                imageUrl: "https://images.unsplash.com/photo-1614728853951-db177d671b56?q=80&w=2608&auto=format&fit=crop"
            },
            {
                name: "Tierra",
                slug: "earth",
                description: "Ciudad Código. El hogar de la programación. Aprende Python, Lógica y Algoritmos en un entorno seguro.",
                locked: false,
                imageUrl: "https://images.unsplash.com/photo-1614730341194-75c60740a08f?q=80&w=2574&auto=format&fit=crop"
            },
            {
                name: "Marte",
                slug: "mars",
                description: "Base Robótica. Colonia de ingeniería avanzada. Domina circuitos, sensores y rovers autónomos.",
                locked: false,
                imageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2608&auto=format&fit=crop"
            },
            {
                name: "Júpiter",
                slug: "jupiter",
                description: "Gigante de Datos. Procesamiento masivo de información y bases de datos distribuidas.",
                locked: true,
                imageUrl: "https://images.unsplash.com/photo-1614732414444-2436d015c55c?q=80&w=2608&auto=format&fit=crop"
            },
            {
                name: "Saturno",
                slug: "saturn",
                description: "Anillos de Red. Protocolos de comunicación, ciberseguridad y topologías de red.",
                locked: true,
                imageUrl: "https://images.unsplash.com/photo-1614727187346-798e0d8eb5d1?q=80&w=2574&auto=format&fit=crop"
            },
            {
                name: "Urano",
                slug: "uranus",
                description: "Laboratorio Cryo. Tecnología de enfriamiento y superconductores cuánticos.",
                locked: true,
                imageUrl: "https://images.unsplash.com/photo-1614726365723-49cfaeb5d25c?q=80&w=2608&auto=format&fit=crop"
            },
            {
                name: "Neptuno",
                slug: "neptune",
                description: "Abismo IA. Redes neuronales profundas e inteligencia artificial avanzada.",
                locked: true,
                imageUrl: "https://images.unsplash.com/photo-1614729375687-ac0b933a2072?q=80&w=2574&auto=format&fit=crop"
            }
        ]).onConflictDoNothing();

        console.log("✅ Worlds seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed();
