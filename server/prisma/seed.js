import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import { MOCK_GAMES, MOCK_PLAYERS } from '../data/mockData.js';

dotenv.config();

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log('🌱 Starting database seed...');

    await prisma.game.createMany({
        data: MOCK_GAMES,
    });

    await prisma.player.createMany({
        data: MOCK_PLAYERS,
    });

    console.log(`✅ Added ${MOCK_GAMES.length} games`);
    console.log(`✅ Added ${MOCK_PLAYERS.length} players`);
    console.log('🎮 Database seed completed successfully!');
}

main()
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });