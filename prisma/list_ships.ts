import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const ships = await prisma.ship.findMany({ select: { id: true, name: true, urlSlug: true } });
  const fs = require('fs');
  fs.writeFileSync('ships.txt', JSON.stringify(ships, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
