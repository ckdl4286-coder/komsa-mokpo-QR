import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 [DB 세척] 중복 링크 및 잘못된 주소 체계 정화 작업 시작...');

  // 1. 중복된 ShipLink 제거 (동일한 shipId, title, url을 가진 데이터들 소탕)
  const allLinks = await prisma.shipLink.findMany();
  const seen = new Set();
  const duplicates = [];

  for (const link of allLinks) {
    const key = `${link.shipId}-${link.title}-${link.url}`;
    if (seen.has(key)) {
      duplicates.push(link.id);
    } else {
      seen.add(key);
    }
  }

  if (duplicates.length > 0) {
    await prisma.shipLink.deleteMany({
      where: { id: { in: duplicates } }
    });
    console.log(`✅ 중복된 링크 ${duplicates.length}개를 성공적으로 소탕했습니다!`);
  }

  // 2. 잘못된 URL 주소 체계 교정 (/ship/ 경로 제거)
  const ships = await prisma.ship.findMany();
  for (const ship of ships) {
    let updated = false;
    let { checklistUrl, regulationsUrl, safetyInfoUrl } = ship;

    // 만약 주소에 /ship/ 이 섞여있다면 원래 주소로 치환 (Next.js 구조에 맞춤)
    if (checklistUrl?.includes('/ship/')) {
       checklistUrl = checklistUrl.replace('/ship/', '/');
       updated = true;
    }
    if (regulationsUrl?.includes('/ship/')) {
       regulationsUrl = regulationsUrl.replace('/ship/', '/');
       updated = true;
    }

    if (updated) {
      await prisma.ship.update({
        where: { id: ship.id },
        data: { checklistUrl, regulationsUrl }
      });
      console.log(`🚀 [${ship.name}] 주소 경로를 정상화했습니다. (/ship/ 제거)`);
    }
  }

  console.log('\n🎉 [정화 완료] 이제 모든 링크와 주소가 깨끗해졌습니다!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
