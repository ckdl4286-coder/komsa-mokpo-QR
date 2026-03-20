import React, { useEffect, useState } from 'react';
import { ExternalLink, Navigation, Info, Zap, Bus, CalendarClock, ChevronRight, CheckSquare, Anchor, Heart } from 'lucide-react';
import styles from './page.module.css';

export function Tracker({ shipId }: { shipId: string }) {
  useEffect(() => {
    fetch('/api/stats/visit', { method: 'POST', body: JSON.stringify({ shipId }), headers: { 'Content-Type': 'application/json' } });
  }, [shipId]);
  return null;
}

export function FavoriteButton({ shipId }: { shipId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('komsa_favorites') || '[]');
    setIsFavorite(favorites.includes(shipId));
  }, [shipId]);

  const toggleFavorite = async () => {
    const favorites = JSON.parse(localStorage.getItem('komsa_favorites') || '[]');
    let newFavorites;
    let action: 'add' | 'remove';

    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== shipId);
      action = 'remove';
    } else {
      newFavorites = [...favorites, shipId];
      action = 'add';
    }

    localStorage.setItem('komsa_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);

    // DB 통계 API 호출
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
    <button 
      onClick={toggleFavorite}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
        width: '46px',
        height: '46px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        backdropFilter: 'blur(10px)',
        color: isFavorite ? '#ff4d4d' : '#fff',
        boxShadow: isFavorite ? '0 0 20px rgba(255, 77, 77, 0.5)' : 'none'
      }}
    >
      <Heart fill={isFavorite ? '#ff4d4d' : 'none'} size={24} strokeWidth={isFavorite ? 0 : 2} />
    </button>
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
  const handleClick = () => {
    if (url) {
      fetch('/api/stats/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shipId, linkId, title }) });
    }
  };

  const getIcon = () => {
    if(iconName === 'CheckSquare') return <CheckSquare size={22} />;
    if(iconName === 'Navigation') return <Navigation size={22} />;
    if(iconName === 'Anchor') return <Anchor size={22} />;
    if(iconName === 'ExternalLink') return <ExternalLink size={20} />;
    return <ChevronRight size={20} />;
  };

  return (
    <a 
      href={url || '#'} 
      target="_blank" 
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
  );
}
