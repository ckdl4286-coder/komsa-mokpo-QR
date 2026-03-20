'use client';
import { ChevronRight } from 'lucide-react';

export function BandStatusButton({ shipId }: { shipId: string }) {
  return (
    <a 
      href="https://band.us/band/71958658/post" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="statusBtn"
      onClick={() => {
        fetch('/api/stats/click', { 
           method: 'POST', 
           headers: { 'Content-Type': 'application/json' }, 
           body: JSON.stringify({ shipId, title: '[외부] 밴드 실시간 운항정보' }) 
        });
      }}
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #03c75a 0%, #029342 100%)', 
        color: 'white', 
        padding: '1.25rem 1rem', 
        borderRadius: '20px', 
        fontWeight: 700, 
        fontSize: '1.1rem', 
        boxShadow: '0 8px 25px rgba(3, 199, 90, 0.4)', 
        textDecoration: 'none', 
        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', fontWeight: 850 }}>
        📢 실시간 운항동태 바로 확인 (네이버 밴드) <ChevronRight size={18} />
      </div>
      <div style={{ fontSize: '0.85rem', opacity: 0.95, marginTop: '6px', fontWeight: 500, letterSpacing: '-0.2px' }}>
        목포 여객선 운항정보를 가장 빠르게 확인하세요
      </div>
    </a>
  );
}
