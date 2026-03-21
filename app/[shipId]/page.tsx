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
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <img
            src="/haesooho_hello.jpg"
            alt="해수호 캐릭터"
            style={{
              width: '80px', height: '80px', objectFit: 'cover',
              borderRadius: '50%', border: '3px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.2)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
            }}
          />
          <div style={{ textAlign: 'left' }}>
             <div style={{ fontSize: '0.8rem', color: '#00d4ff', fontWeight: 900, marginBottom: '2px', letterSpacing: '-0.5px' }}>한국해양교통안전공단</div>
             <div style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>목포운항관리센터</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1.2rem', marginBottom: '0.2rem' }}>
          <h1 className={styles.shipName} style={{ fontSize: '2.2rem', marginBottom: 0, letterSpacing: '-1px' }}>{ship.name}</h1>
          <FavoriteButton shipId={ship.id} />
        </div>
        <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
           SAFE NAVIGATION INFORMATION PORTAL
        </div>
      </header>

      {/* 🟢 핵심 개선: 지금 상태 바로 띄우기 & 업데이트 시간 복구 */}
      <div className={styles.statusBox} style={{ marginTop: '-1.5rem', zIndex: 10, position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
        <div className={styles.statusLabelContainer} style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={styles.statusLabel} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
             ● 실시간 API 데이터 연동 중
          </span>
          <span className={styles.updateTime} style={{ fontSize: '0.75rem', color: '#00d4ff', fontWeight: 700 }}>
             방금 업데이트됨
          </span>
        </div>
        
        <div
          className={`${styles.statusBadge} ${statusInfo.label.includes('정상') ? styles.glowing : ''}`}
          style={{ 
            background: statusInfo.color, color: '#fff', width: '100%', 
            justifyContent: 'center', fontSize: '1.6rem', padding: '1.25rem',
            borderRadius: '24px', fontWeight: 900, textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
        >
          {statusInfo.emoji} {statusInfo.label}
        </div>

        <div style={{ marginTop: '1.2rem', textAlign: 'center' }}>
           <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
              ※ 상세 운항 시간 및 변동 사항은 네이버 밴드에서 확인하세요.
           </p>
           <BandStatusButton shipId={ship.id} />
        </div>

        {statusInfo.reason && (
          <p className={styles.statusDesc} style={{ color: '#ff4d4d', fontWeight: 800, marginTop: '1rem', border: '2px dashed #ff4d4d', padding: '0.5rem', borderRadius: '8px' }}>
            사유: {statusInfo.reason}
          </p>
        )}

        {/* 운항 스케줄 상세 */}
        {schedules && schedules.length > 0 && (
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            {schedules.slice(0, 3).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 800 }}>🕐 {formatTime(s.sail_tm)}</span>
                <span style={{ opacity: 0.4 }}>|</span>
                <span style={{ fontWeight: 500 }}>{s.oport_nm} ➔ {s.dest_nm}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ justifyContent: 'space-between' }}>
           <span><ShieldCheck size={18} /> 선박 필수 안전 정보</span>
           <img src="/haesooho_search.jpg" alt="조사하는 해수호" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #00d4ff', marginLeft: 'auto' }} />
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ActionButton 
            shipId={ship.id} 
            linkId="core_checklist" 
            url={ship.checklistUrl || ""} 
            title="출항 전 점검표 확인" 
            description="우리 배가 안전하게 점검되었는지 최신 점검표를 직접 확인해보세요!"
            guideText="점검표 보기"
            iconName="CheckSquare" 
            primary={true} 
          />
          <ActionButton 
            shipId={ship.id} 
            linkId="core_regulations" 
            url={ship.regulationsUrl || ""} 
            title="운항관리규정 열람" 
            description="선박 통제 규정, 차량 적재 및 허용 기준 등을 확인할 수 있습니다."
            guideText="규정 보기"
            iconName="Navigation" 
            primary={false} 
          />
          <ActionButton 
            shipId={ship.id} 
            linkId="core_safety" 
            url={ship.safetyInfoUrl || ""} 
            title="여객선 안전정보 조회" 
            description="선박 검사 이력과 사고 현황 등 안전 핵심 정보를 투명하게 공개합니다."
            guideText="정보 보기"
            iconName="ShieldAlert" 
            primary={false} 
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
           <Activity size={18} /> 편리한 부가 서비스 안내
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ActionButton 
            shipId={ship.id} 
            linkId="service_patis" 
            url="https://mtis.komsa.or.kr/viewer/m" 
            title="선박 실시간 위치 및 정보" 
            description="전국 여객선의 현재 위치와 항로 정보를 PATIS로 확인하세요!"
            guideText="지도 보기"
            iconName="MapPin" 
          />
          <ActionButton 
            shipId={ship.id} 
            linkId="service_ev" 
            url="https://docs.google.com/forms/d/e/1FAIpQLSfcl6G0YvPZq3i7mXclG0n_p2mYp6F7_k6kX..." 
            title="전기차 배터리 점검 서비스" 
            description="사전 예약을 통해 출항 전 전기차 배터리 안심 점검을 받아보세요."
            guideText="예약하기"
            isFree={true}
            iconName="ShieldCheck" 
          />
          <ActionButton 
            shipId={ship.id} 
            linkId="service_vr" 
            url="https://www.youtube.com/playlist?list=PLtY6qP5v0cW97FjE2m9r1_Z6X_eX..." 
            title="생생한 여객선 VR 체험" 
            description="가상현실로 체험하는 여객선 안전 교육 콘텐츠를 시청하세요."
            guideText="체험하기"
            iconName="Zap" 
          />

          {/* DB 링크 (중복 절대 제외) */}
          {ship.links
            .filter((link: any) => 
               !link.title.includes('PATIS') && 
               !link.title.includes('전기차') && 
               !link.title.includes('밴드') &&
               !link.title.includes('VR') &&
               !link.title.includes('어때') &&
               !link.title.includes('운항정보') &&
               !link.url.includes('band.us') &&
               !link.url.includes('komsa.or.kr/viewer') &&
               !link.url.includes('docs.google.com/forms') 
            )
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

      <footer style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '3rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem' }}>
         <p style={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>한국해양교통안전공단 목포운항관리센터</p>
         <p>© 2026 KOMSA MOKPO STATION. ALL RIGHTS RESERVED.</p>
         <p style={{ marginTop: '8px', letterSpacing: '0.5px', color: '#00d4ff' }}>세상에서 가장 안전한 바닷길을 만듭니다.</p>
      </footer>
    </div>
  );
}
