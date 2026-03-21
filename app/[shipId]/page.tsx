import { notFound } from 'next/navigation';
import { prisma } from '../lib/db';
import styles from './page.module.css';
import { Tracker, ActionButton, FavoriteButton } from './ClientInteractions';
import { BandStatusButton } from './BandStatusButton';
import { ShieldCheck, Activity, MapPin, Zap, CheckSquare, Navigation, ShieldAlert } from 'lucide-react';
import { fetchShipSchedule, getStatusInfo, formatTime, formatDate } from '../lib/komsa';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // 캐시 즉시 무효화

// [Build Version: 2026.03.21.0925] - UI/UX 완벽 갱신용
export default async function ShipPage({ params }: { params: Promise<{ shipId: string }> }) {
  const { shipId } = await params;
  const decodedSlug = decodeURIComponent(shipId);
  const ship = await prisma.ship.findUnique({
    where: { urlSlug: decodedSlug },
    include: { links: true }
  });

  if (!ship) return notFound();

  const config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });

  // 오늘 날짜 및 요일 포맷 정보 준비
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dayOfWeek = today.getDay(); // 0: 일, 6: 토
  const dayName = today.toLocaleDateString('ko-KR', { weekday: 'short' });
  const dayColor = dayOfWeek === 0 ? '#ff5252' : (dayOfWeek === 6 ? '#52a2ff' : '#fff');
  
  const displayDate = (
    <>
      {formatDate(`${yyyy}${mm}${dd}`)} <span style={{ color: dayColor, fontWeight: 900 }}>({dayName})</span>
    </>
  );

  // KOMSA API로 운항 일정 조회
  let schedules = null;
  try {
    schedules = await fetchShipSchedule(ship.name);
  } catch (e) {
    console.error('[선박 페이지] 운항 일정 조회 실패:', e);
  }

  const mainSchedule = schedules?.[0] ?? null;
  const statusInfo = getStatusInfo(mainSchedule);

  return (
    <div className={styles.container}>
      <Tracker shipId={ship.id} />
      
      <header className={styles.header} style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        paddingTop: '1.2rem', paddingBottom: '0.4rem', gap: '0.4rem' 
      }}>
        {/* 🏛️ 최상단: 공단 공식 로고만 깔끔하게 하나! (높이 최소화) */}
        <div style={{ marginBottom: '0.4rem' }}>
          <img
            src="/komsa_official_logo.png"
            alt="공단 로고"
            style={{ width: '135px', height: 'auto', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.2))' }}
          />
        </div>

        {/* 🚢 선박 이름 (상단으로 더 밀착) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <h1 className={styles.shipName} style={{ fontSize: '2.1rem', marginBottom: 0, letterSpacing: '-0.5px' }}>{ship.name}</h1>
          <FavoriteButton shipId={ship.id} />
        </div>
      </header>

      <div className={styles.statusBox} style={{ padding: '0.8rem 1rem', marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: '#00d4ff', fontWeight: 900, textShadow: '0 0 10px rgba(0,212,255,0.3)' }}>
               ● 실시간 연동 중 
            </span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
               방금 업데이트됨
            </span>
          </div>
          
          {/* 📅 날짜와 🚢 상태를 한 줄로 결합! */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'nowrap', width: '100%' }}>
            <div style={{ 
              fontSize: '1rem', color: '#fff', fontWeight: 900, 
              letterSpacing: '-0.5px', background: 'rgba(255,255,255,0.05)',
              padding: '6px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              📅 {displayDate}
            </div>
            
            <div className="glowing" style={{ 
              background: statusInfo.color, color: '#fff', 
              padding: '6px 16px', borderRadius: '12px', fontWeight: 900, 
              fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', gap: '6px',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              {statusInfo.emoji} {statusInfo.label}
            </div>
          </div>

          {/* 🕐 운항 정보 리스트 - 세로형 복구 (가독성 증대) */}
          {schedules && schedules.length > 0 && (
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', marginTop: '0.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {schedules.slice(0, 3).map((s:any, i:number) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 800 }}>🕐 {formatTime(s.sail_tm)}</span>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <span style={{ fontWeight: 500 }}>{s.oport_nm} ➔ {s.dest_nm}</span>
                </div>
              ))}
            </div>
          )}

          {statusInfo.reason && (
            <p style={{ color: '#ff4d4d', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center', margin: '4px 0', border: '1px dashed rgba(255,77,77,0.3)', padding: '4px', borderRadius: '8px' }}>
              ⚠️ 사유: {statusInfo.reason}
            </p>
          )}

          {/* 밴드 이동 (공간 최소화) */}
          <div style={{ marginTop: '0.2rem' }}>
             <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: '0.4rem', textAlign: 'center' }}>
                ※ 전체 선박 운항상태 알림 (밴드)
             </p>
             <BandStatusButton shipId={ship.id} />
          </div>
        </div>
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

      <section className={styles.section} style={{ marginTop: '2.5rem' }}>
        <h2 className={styles.sectionTitle}>
           <Activity size={18} /> 편리한 부가 서비스 안내
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ship.links
            .filter((link: any) => {
              const title = link.title || '';
              // 핵심 안전 정보 섹션에서 이미 다루는 항목과 유선문의 필터링
              const isCommonLink = ['운항관리규정', '안전정보', '점검표', '유선문의'].some(k => title.includes(k));
              return !isCommonLink;
            })
            .map((link: any) => {
              let desc = '여객선 이용을 위한 편리한 부가 서비스입니다.';
              let guideText = '바로가기';
              let icon = link.icon || 'ExternalLink';
              let myUrl = link.url;
              let displayTitle = link.title;

              // 프리미엄 UI 및 문구 오버라이드
              if (title.includes('PATIS') || title.includes('위치')) {
                 desc = '공식 앱을 설치하고 전국 모든 여객선의 실시간 위치와 정보를 손쉽게 확인하세요.';
                 guideText = '앱 설치';
                 icon = 'MapPin';
                 displayTitle = "실시간 선박 위치 (MTIS 앱)";
                 myUrl = "https://play.google.com/store/apps/details?id=kr.or.komsa.mtis&pcampaignid=web_share";
              } 
              else if (title.includes('VR')) {
                 desc = '가상현실로 체험하는 여객선 안전 교육 콘텐츠를 시청하세요.';
                 guideText = '체험하기';
                 icon = 'Zap';
              }
              else if (title.includes('전기차')) {
                 desc = '사전 예약을 통해 출항 전 전기차 배터리 안심 점검서비스를 무상으로 받아보세요.';
                 guideText = '안심 예약';
                 icon = 'ShieldCheck';
                 displayTitle = "전기차 배터리 안심 점검 서비스";
              }

              return (
                <ActionButton 
                  key={link.id} 
                  shipId={ship.id} 
                  linkId={link.id} 
                  url={myUrl} 
                  title={displayTitle} 
                  description={desc}
                  guideText={guideText}
                  iconName={icon} 
                />
              );
            })}
        </div>
      </section>

      <footer style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '3.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem' }}>
         <div style={{ marginBottom: '1.2rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'inline-block' }}>
           <span style={{ color: 'rgba(255,255,255,0.5)', marginRight: '8px', fontWeight: 500 }}>여객선 안전정보 문의</span>
           <a 
             href="tel:0507-1352-9457" 
             style={{ fontSize: '1.1rem', color: '#00d4ff', fontWeight: 800, textDecoration: 'none' }}
           >
             0507-1352-9457
           </a>
         </div>
         
         <p style={{ fontWeight: 800, color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', fontSize: '0.9rem' }}>한국해양교통안전공단 목포운항관리센터</p>
         <p>© {new Date().getFullYear()} MOPO MARITIME SAFETY. 본 관리 시스템의 모든 권리는 공단에 있습니다.</p>
         <p style={{ marginTop: '10px', letterSpacing: '0.5px', color: '#00d4ff', fontWeight: 600, fontSize: '0.8rem' }}>세상에서 가장 안전한 바닷길을 만듭니다.</p>
      </footer>
    </div>
  );
}
