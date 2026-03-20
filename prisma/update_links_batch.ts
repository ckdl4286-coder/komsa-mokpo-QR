import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const shipData = [
  { name: '퀸제누비아', checklist: 'https://mtis.komsa.or.kr/check?shipId=2010001', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8492', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8491' },
  { name: '퀸제누비아2', checklist: 'https://mtis.komsa.or.kr/check?shipId=2024005', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8494', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8493' },
  { name: '실버클라우드', checklist: 'https://mtis.komsa.or.kr/check?shipId=2018002', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8050', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8049' },
  { name: '골드스텔라', checklist: 'https://mtis.komsa.or.kr/check?shipId=2020010', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8052', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8051' },
  { name: '송림블루오션', checklist: 'https://mtis.komsa.or.kr/check?shipId=2017008', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7820', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7819' },
  { name: '진도안개', checklist: 'https://mtis.komsa.or.kr/check?shipId=2021003', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8214', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8213' },
  { name: '뉴드림', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7822', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7821' },
  { name: '대흥고속카페리', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7816', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7815' },
  { name: '도초카훼리', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7932', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7931' },
  { name: '천사카훼리', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7934', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7933' },
  { name: '섬사랑3', checklist: 'https://mtis.komsa.or.kr/check?shipId=2000005', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7924', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7923' },
  { name: '섬사랑9', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7922', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7921' },
  { name: '섬사랑10', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7926', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7925' },
  { name: '섬사랑11', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7928', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7927' },
  { name: '섬사랑12', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7930', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7929' },
  { name: '섬사랑13', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7930', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7929' },
  { name: '섬사랑15', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7930', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7929' },
  { name: '섬사랑16', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7930', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7929' },
  { name: '섬사랑17', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7930', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=7929' },
  { name: '슬로시티', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8100', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8099' },
  { name: '해진고속', regulations: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8200', safety: 'https://www.komsa.or.kr/bbs/BBSMSTR_000000000731/view.do?nttId=8199' },
  { name: '천사1', checklist: 'https://mtis.komsa.or.kr/check?shipId=2015012' },
  { name: '천사2', checklist: 'https://mtis.komsa.or.kr/check?shipId=2015013' },
  { name: '천사3', checklist: 'https://mtis.komsa.or.kr/check?shipId=2015014' },
  { name: '뉴엔젤', checklist: 'https://mtis.komsa.or.kr/check?shipId=2021001' },
  { name: '엔젤', checklist: 'https://mtis.komsa.or.kr/check?shipId=2021002' }
];

async function main() {
  const dbShips = await prisma.ship.findMany({ select: { id: true, name: true } });
  let updateCount = 0;

  console.log('🚀 지능형 선박 데이터 이식 시작...');

  for (const item of shipData) {
    // 지능형 매칭: 공백 제거, '호' 제거 후 비교
    const targetName = item.name.replace(/\s/g, '').replace('호', '');
    
    const matchedShip = dbShips.find(s => {
      const dbName = s.name.replace(/\s/g, '').replace('호', '');
      return dbName.includes(targetName) || targetName.includes(dbName);
    });

    if (matchedShip) {
      await prisma.ship.update({
        where: { id: matchedShip.id },
        data: {
          checklistUrl: item.checklist || undefined,
          regulationsUrl: item.regulations || undefined,
          safetyInfoUrl: item.safety || undefined
        }
      });
      console.log(`✅ [${matchedShip.name}] 업데이트 완료! (매칭됨: ${item.name})`);
      updateCount++;
    } else {
      console.warn(`❌ [${item.name}] 매칭되는 선박을 DB에서 찾을 수 없습니다.`);
    }
  }

  console.log(`\n🎉 총 ${updateCount}척의 선박 안전 링크가 성공적으로 이식되었습니다!`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
