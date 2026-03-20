import { notFound } from 'next/navigation';
import { prisma } from '../lib/db';
import styles from './page.module.css';
import { Tracker, ActionButton } from './ClientInteractions';
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
            src="/character.jpg"
            alt="KOMSA 캐릭터"
            style={{
              width: '100px', height: '100px', objectFit: 'cover',
              margin: '0 auto 1.5rem auto', display: 'block',
              borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)',
              padding: '4px', background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(5px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          />
        </div>
        <h1 className={styles.shipName}>{ship.name}</h1>
        <div className={styles.subTitle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
           <img src="/logo.png" alt="KOMSA 로고" style={{ height: '14px', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
           <span>전국 여객선 안전 정보 서비스</span>
        </div>
      </header>

      <div className={styles.statusBox}>
        <span className={styles.statusLabel}>
          {mainSchedule?.rlvt_ymd ? `${formatDate(mainSchedule.rlvt_ymd)} 운항 예보` : '실시간 운항 예보'}
        </span>
        
        <div
          className={`${styles.statusBadge} ${statusInfo.label.includes('정상') ? styles.glowing : ''}`}
          style={{ background: statusInfo.color, color: '#fff' }}
        >
          {statusInfo.emoji} {statusInfo.label}
        </div>

        {statusInfo.reason && (
          <p className={styles.statusDesc} style={{ color: '#ff4d4d', fontWeight: 700 }}>
            사유: {statusInfo.reason}
          </p>
        )}

        {schedules && schedules.length > 0 ? (
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem' }}>
            {schedules.slice(0, 3).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '0.3rem' }}>
                <span>🕐 {formatTime(s.sail_tm)}</span>
                <span style={{ opacity: 0.6 }}>|</span>
                <span>{s.oport_nm} ➔ {s.dest_nm}</span>
              </div>
            ))}
          </div>
        ) : (
          adminWeather && <p className={styles.statusDesc}>{adminWeather}</p>
        )}

        <div style={{ marginTop: '1.5rem' }}>
           <BandStatusButton shipId={ship.id} />
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
           <ShieldCheck size={18} /> 필수 안전 정보
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <ActionButton shipId={ship.id} linkId="core" url={ship.checklistUrl || ""} title="출항 전 점검표 확인" iconName="CheckSquare" primary={true} />
          <ActionButton shipId={ship.id} linkId="core" url={ship.regulationsUrl || ""} title="운항관리규정 전문" iconName="Navigation" primary={false} />
          <ActionButton shipId={ship.id} linkId="core" url={ship.safetyInfoUrl || ""} title="여객선 안전정보 공시" iconName="Anchor" primary={false} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
           <Activity size={18} /> 추가 편의 서비스
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {ship.links.map((link: any) => (
            <ActionButton key={link.id} shipId={ship.id} linkId={link.id} url={link.url} title={link.title} iconName={link.icon || 'ExternalLink'} />
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
