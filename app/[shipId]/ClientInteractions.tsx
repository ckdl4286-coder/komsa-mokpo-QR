'use client';
// Vercel Deploy Trigger [2026.03.21.1330]

import React, { useEffect, useState } from 'react';
import { ExternalLink, Navigation, Info, Zap, Bus, CalendarClock, ChevronRight, CheckSquare, Anchor, Heart } from 'lucide-react';
import styles from './page.module.css';

export function Tracker({ shipId }: { shipId: string }) {
  useEffect(() => {
    fetch('/api/stats/visit', { method: 'POST', body: JSON.stringify({ shipId }), headers: { 'Content-Type': 'application/json' } });
  }, [shipId]);
  return null;
}

export function FavoriteButton({ shipId, shipName }: { shipId: string; shipName?: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('komsa_favorites') || '[]');
    setIsFavorite(favorites.includes(shipId));
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, [shipId]);

  const toggleFavorite = async () => {
    const favorites = JSON.parse(localStorage.getItem('komsa_favorites') || '[]');
    let newFavorites;
    let action: 'add' | 'remove';

    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== shipId);
      action = 'remove';
      setShowGuide(false);
    } else {
      newFavorites = [...favorites, shipId];
      action = 'add';
      setShowGuide(true);
    }

    localStorage.setItem('komsa_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);

    try {
      await fetch('/api/stats/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipId, action })
      });
    } catch (e) {
      console.error('[즐겨찾기] 통계 서버 전송 실패:', e);
    }
  };

  return (
    <>
      <button 
        onClick={toggleFavorite}
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '50%',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          backdropFilter: 'blur(10px)',
          color: isFavorite ? '#ff4d4d' : '#fff',
          boxShadow: isFavorite ? '0 0 20px rgba(255, 77, 77, 0.6)' : 'none',
          flexShrink: 0
        }}
      >
        <Heart 
          fill={isFavorite ? '#ff4d4d' : 'none'} 
          size={22} 
          strokeWidth={isFavorite ? 0.5 : 2.5} 
          style={{ filter: isFavorite ? 'drop-shadow(0 0 5px rgba(255, 77, 77, 0.8))' : 'none' }}
        />
      </button>

      {/* 어르신을 위한 쉬운 안내 팝업 */}
      {showGuide && typeof window !== 'undefined' && require('react-dom').createPortal(
        <div 
          onClick={() => setShowGuide(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 999999, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', padding: '1.5rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '28px',
              padding: '2.5rem 1.5rem',
              maxWidth: '360px', width: '100%',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              textAlign: 'center',
              color: '#333',
              position: 'relative',
              animation: 'fadeInUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>❤️</div>
            <h3 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#e11d48', marginBottom: '0.8rem', letterSpacing: '-1px' }}>
              '이 배 찜하기' 완료!
            </h3>
            <p style={{ fontSize: '1.1rem', color: '#475569', fontWeight: 800, marginBottom: '2rem', lineHeight: 1.5 }}>
              바탕화면에 설치해두시면<br/>더욱 편하게 보실 수 있습니다.
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '1.5rem 1.2rem', marginBottom: '2rem', textAlign: 'left', border: '2px solid #e2e8f0' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>
                📱 내 폰 바탕화면에 추가하는 법:
              </p>
              
              {isIOS ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '1.05rem', color: '#334155', display: 'flex', gap: '10px' }}>
                    <span style={{color:'#e11d48', fontWeight:900}}>①</span>
                    <span>화면 밑의 <b>사각형 화살표 (↑)</b> 터치</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', color: '#334155', display: 'flex', gap: '10px' }}>
                    <span style={{color:'#e11d48', fontWeight:900}}>②</span>
                    <span><b>'홈 화면에 추가'</b> 터치 끝!</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontSize: '1.05rem', color: '#334155', display: 'flex', gap: '10px' }}>
                    <span style={{color:'#e11d48', fontWeight:900}}>①</span>
                    <span>화면 구석의 <b>점 세개 (⋮)</b> 터치</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', color: '#334155', display: 'flex', gap: '10px' }}>
                    <span style={{color:'#e11d48', fontWeight:900}}>②</span>
                    <span><b>'홈 화면에 추가'</b> 터치 끝!</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              style={{
                width: '100%', padding: '1.2rem', borderRadius: '18px',
                background: '#e11d48', color: '#fff', 
                fontWeight: 900, fontSize: '1.25rem',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 15px rgba(225, 29, 72, 0.4)'
              }}
            >
              내용을 확인했습니다
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export function ActionButton({ 
  shipId, linkId, url, title, iconName, primary = false, description, guideText, isFree = false
}: { 
  shipId: string; 
  linkId?: string; 
  url: string; 
  title: string; 
  iconName: string; 
  primary?: boolean;
  description?: string;
  guideText?: string;
  isFree?: boolean;
}) {
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!url || url === 'tracking-only') {
      e.preventDefault();
      setShowPopup(true);
      return;
    }
    fetch('/api/stats/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shipId, linkId, title }) });
  };

  const getIcon = () => {
    if(iconName === 'CheckSquare') return <CheckSquare size={22} />;
    if(iconName === 'Navigation') return <Navigation size={22} />;
    if(iconName === 'Anchor') return <Anchor size={22} />;
    if(iconName === 'ExternalLink') return <ExternalLink size={20} />;
    return <ChevronRight size={20} />;
  };

  return (
    <>
      <a 
        href={url && url !== 'tracking-only' ? url : '#'} 
        target={url && url !== 'tracking-only' ? "_blank" : undefined}
        rel="noopener noreferrer" 
        onClick={handleClick}
        className={`${styles.actionItem} ${primary ? styles.actionItemPrimary : ''}`}
        style={{ flexDirection: 'column', alignItems: 'flex-start', padding: description ? '1.4rem' : '1.1rem 1.25rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: description ? '0.6rem' : '0' }}>
          <div className={styles.actionItemLeft}>
            <div className={styles.iconBox}>
              {getIcon()}
            </div>
            <span className={styles.actionTitle}>{title}</span>
          </div>
          {guideText && (
            <span className={styles.actionGuide}>
              {guideText} <ChevronRight size={14} />
            </span>
          )}
        </div>
        
        {description && (
          <span className={styles.actionDesc}>
            {description}
          </span>
        )}
        {isFree && (
          <span className={styles.freeBadge}>무료</span>
        )}
        {!guideText && !description && <ChevronRight size={18} style={{ position: 'absolute', right: '1.25rem', opacity: 0.5, color: '#fff' }} />}
      </a>

      {showPopup && (
        <div 
          onClick={(e) => { e.preventDefault(); setShowPopup(false); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', padding: '1.5rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '24px', padding: '2.5rem 1.5rem', maxWidth: '340px', width: '100%',
              border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              textAlign: 'center', animation: 'fadeInUp 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>🚧</div>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.5px' }}>서비스 안내</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', wordBreak: 'keep-all' }}>
              해당 선박의 <b>{title}</b> 정보가 아직 등록되지 않았거나, 시스템 연결 오류를 <b>해결 중</b>입니다.<br/><br/>
              최대한 빠르게 안전 정보를 확인하실 수 있도록 조치하겠습니다.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                width: '100%', padding: '1rem', borderRadius: '14px',
                background: 'linear-gradient(135deg, #00d4ff, #0077ff)', color: '#fff', fontWeight: 800,
                border: 'none', cursor: 'pointer', fontSize: '1.05rem',
                boxShadow: '0 8px 20px rgba(0, 212, 255, 0.3)'
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
