import { notFound } from 'next/navigation';
import { prisma } from '../lib/db';
import styles from './page.module.css';
import { Tracker, ActionButton, FavoriteButton } from './ClientInteractions';
import { BandStatusButton } from './BandStatusButton';
import { Ship, ShieldCheck, Activity } from 'lucide-react';
import { fetchShipSchedule, getStatusInfo, formatTime, formatDate } from '../lib/komsa';

export const dynamic = 'force-dynamic';

export default async function ShipPage({ params }: { params: Promise<{ shipId: string }> }) {
  const { shipId } = await params;
  const decodedSlug = decodeURIComponent(shipId);
  const ship = await prisma.ship.findUnique({
    where: { urlSlug: decodedSlug },
    include: { links: true }
  });

  if (!ship) return notFound();

  const config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });

  // KOMSA API로 내일 운항 일정 조회
  let schedules = null;
  try {
    schedules = await fetchShipSchedule(ship.name);
  } catch (e) {
    console.error('[선박 페이지] 운항 일정 조회 실패:', e);
  }

  // 대표 운항 상태 (첫 번째 스케줄 기준)
  const mainSchedule = schedules?.[0] ?? null;
  const statusInfo = getStatusInfo(mainSchedule);

  // 관리자가 입력한 날씨 메시지 (API 대체 or 보완용)
  const adminWeather = config?.tomorrowWeather;

  return (
    <div className={styles.container}>
      <Tracker shipId={ship.id} />
      
      <header className={styles.header}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src="/haesooho_hello.jpg"
            alt="해수호 캐릭터"
            style={{
              width: '120px', height: '120px', objectFit: 'cover',
              margin: '0 auto 1.2rem auto', display: 'block',
              borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)',
              padding: '2px', background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(5px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
            }}
          />
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', zIndex: 10 }}>
            <FavoriteButton shipId={ship.id} />
          </div>
        </div>
        <h1 className={styles.shipName}>{ship.name}</h1>
        <div className={styles.subTitle}>
           KOREA MARITIME TRANSPORTATION SAFETY AUTHORITY
        </div>
      </header>

      <div className={styles.statusBox}>
        <div className={styles.statusLabelContainer}>
          <span className={styles.statusLabel}>
             ● 실시간 API 데이터 연동 중
          </span>
          <span className={styles.updateTime}>
             방금 업데이트됨
          </span>
        </div>
        
        <div
          className={`${styles.statusBadge} ${statusInfo.label.includes('정상') ? styles.glowing : ''}`}
          style={{ background: statusInfo.color, color: '#fff', width: '100%', justifyContent: 'center', fontSize: '1.4rem', padding: '1rem' }}
        >
          {statusInfo.emoji} {statusInfo.label}
        </div>

        {statusInfo.reason && (
          <p className={styles.statusDesc} style={{ color: '#ff4d4d', fontWeight: 700, marginTop: '1rem' }}>
            사유: {statusInfo.reason}
          </p>
        )}

        {/* 운항 스케줄 상세 */}
        {schedules && schedules.length > 0 && (
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', marginTop: '1rem', padding: '0.8rem', background: 'rgba(0,0,0,0.1)', borderRadius: '16px' }}>
            {schedules.slice(0, 3).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '0.3rem' }}>
                <span>🕐 {formatTime(s.sail_tm)}</span>
                <span style={{ opacity: 0.6 }}>|</span>
                <span>{s.oport_nm} ➔ {s.dest_nm}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
           <BandStatusButton shipId={ship.id} />
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ justifyContent: 'space-between' }}>
           <span><ShieldCheck size={18} /> 필수 안전 정보 (출항 전 확인)</span>
           <img src="/haesooho_search.jpg" alt="조사하는 해수호" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #00d4ff', marginLeft: 'auto' }} />
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ActionButton 
            shipId={ship.id} 
            linkId="core_checklist" 
            url={ship.checklistUrl || ""} 
            title="출항 전 점검표" 
            description="매 출항 전 실시하는 점검에 따른 가장 최신의 점검표를 바로 확인해보세요!"
            guideText="확인하기"
            iconName="CheckSquare" 
            primary={true} 
          />
          <ActionButton 
            shipId={ship.id} 
            linkId="core_regulations" 
            url={ship.regulationsUrl || ""} 
            title="운항관리규정" 
            description="선박의 날씨 통제규정, 차량 적재량, 허용 위험물 등을 확인하세요!"
            guideText="기준보기"
            iconName="Navigation" 
            primary={false} 
          />
          <ActionButton 
            shipId={ship.id} 
            linkId="core_safety" 
            url={ship.safetyInfoUrl || ""} 
            title="여객선 안전정보" 
            description="우리배의 선박검사 일정과 사고이력을 투명하게 확인하세요!"
            guideText="조회하기"
            iconName="Anchor" 
            primary={false} 
          />
        </div>
      </section>

      <section className={styles.section} style={{ display: schedules && schedules.length > 0 ? 'block' : 'none' }}>
        <h2 className={styles.sectionTitle}>
           <Activity size={18} /> 편리한 부가 서비스 (추가 안내)
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 수동 추가 서비스 (시안 기준) */}
          <ActionButton 
            shipId={ship.id} 
            linkId="service_ev" 
            url="https://docs.google.com/forms/d/e/1FAIpQLSfcl6G0YvPZq3i7mXclG0n_p2mYp6F7_..." 
            title="전기차 배터리 점검 서비스" 
            description="출항 전 전기차 배터리 안심 점검 예약을 도와드립니다."
            guideText="예약하기"
            isFree={true}
            iconName="ShieldCheck" 
          />
          <ActionButton 
            shipId={ship.id} 
            linkId="service_patis" 
            url="https://mtis.komsa.or.kr/viewer/m" 
            title="PATIS 실시간 여객선 정보" 
            description="전국 여객선 위치 확인 및 항로 정보 제공"
            guideText="이동하기"
            iconName="ExternalLink" 
          />

          {/* DB 링크 (중복 제외) */}
          {ship.links
            .filter((link: any) => !link.title.includes('PATIS') && !link.title.includes('전기차'))
            .map((link: any) => (
            <ActionButton 
              key={link.id} 
              shipId={ship.id} 
              linkId={link.id} 
              url={link.url} 
              title={link.title} 
              description={link.title.includes('VR') ? '가상현실로 만나는 여객선 안전 교육' : '여객선을 위한 편리한 부가 서비스를 이용해보세요!'}
              iconName={link.icon || 'ExternalLink'} 
            />
          ))}
        </div>
      </section>

      <footer style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '2rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
         <p>© 2026 한국해양교통안전공단 목포운항관리센터</p>
         <p style={{ marginTop: '5px', letterSpacing: '0.5px' }}>세상에서 가장 안전한 바닷길을 만듭니다.</p>
      </footer>
    </div>
  );
}
