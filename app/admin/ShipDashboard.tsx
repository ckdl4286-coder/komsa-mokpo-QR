import { useState, useEffect } from 'react';
import styles from './admin.module.css';
import { Copy, Link as LinkIcon, BarChart2, Edit2, Trash2, Calendar, User, Users, CalendarDays, Settings, Star, ExternalLink, Activity, Target, PlusCircle, Ship as ShipIcon, ChevronRight, Heart, AlertCircle, RotateCcw } from 'lucide-react';
import { updateCoreLink, updateWeather, deleteCustomLink, addCustomLink, updateCustomLink } from './actions';

export default function ShipDashboard({ ship, config, overallStats, urlOrigin, isGlobal = false }: any) {
  const [tab, setTab] = useState(isGlobal ? 'stats' : 'links');
  const [editing, setEditing] = useState<string | null>(null);
  const [editingVal, setEditingVal] = useState('');
  
  // Safety Features State
  const [deleteConfirmLink, setDeleteConfirmLink] = useState<any>(null); // Link to delete
  const [undoLinkToast, setUndoLinkToast] = useState<any>(null); // Post-deletion info for restore

  // Auto-hide undo toast after 5s
  useEffect(() => {
    if (undoLinkToast) {
       const timer = setTimeout(() => setUndoLinkToast(null), 5000);
       return () => clearTimeout(timer);
    }
  }, [undoLinkToast]);

  const publicUrl = `${urlOrigin}/${ship.urlSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    alert('QR 생성용 URL이 복사되었습니다!');
  };

  const handleSaveCore = async (key: string) => {
    await updateCoreLink(ship.id, key, editingVal);
    setEditing(null);
  };

  const handleSaveWeather = async () => {
    const formData = new FormData();
    formData.append('weather', editingVal);
    await updateWeather(formData);
    setEditing(null);
    window.location.reload();
  };

  const executeDeleteLink = async () => {
    if (!deleteConfirmLink) return;
    const linkToUndo = { ...deleteConfirmLink };
    await deleteCustomLink(deleteConfirmLink.id);
    setUndoLinkToast(linkToUndo);
    setDeleteConfirmLink(null);
  };

  const handleRestoreLink = async () => {
    if (!undoLinkToast) return;
    await addCustomLink(ship.id, undoLinkToast.title, undoLinkToast.url);
    setUndoLinkToast(null);
  };

  const activeLinksCnt = isGlobal ? 0 : 2 + (ship.checklistUrl ? 1 : 0) + (ship.regulationsUrl ? 1 : 0) + (ship.safetyInfoUrl ? 1 : 0) + (ship.links?.filter((l:any)=>l.url!=='tracking-only')?.length || 0);
  const totalLinksCnt = isGlobal ? 0 : 5 + (ship.links?.filter((l:any)=>l.url!=='tracking-only')?.length || 0);

  if (!isGlobal && !ship.links) ship.links = [];
  if (!overallStats) overallStats = { today:0, yesterday:0, week:0, total:0, chart:[], rank:[], shipRank:[], totalClicks:0, maxVisit:1, maxClick:1 };
  if (!overallStats.chart) overallStats.chart = [];
  if (!overallStats.rank) overallStats.rank = [];

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button 
          onClick={ship.onBack || (() => window.location.reload())}
          className={styles.addBtn}
          style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 700 }}
        >
          <ChevronRight size={16} style={{ transform: 'rotate(180deg)', marginRight: '0.5rem' }} /> 선박 목록으로 돌아가기
        </button>
      </div>

      {!isGlobal && (
        <div className={styles.urlCard}>
          <div style={{ flex: 1 }}>
             <div className={styles.urlLabel}>QR 연결 URL (이 주소를 QR코드로 만드세요)</div>
             <a 
               href={publicUrl} 
               target="_blank" 
               rel="noopener noreferrer" 
               className={styles.urlText}
               style={{ textDecoration: 'none', cursor: 'pointer', display: 'block' }}
             >
               {publicUrl} <ExternalLink size={14} style={{ marginLeft: '0.4rem', verticalAlign: 'middle', opacity: 0.7 }} />
             </a>
          </div>
          <button onClick={handleCopy} className={styles.copyBtn}><Copy size={16} /> 복사</button>
        </div>
      )}

      <div className={styles.tabs} style={{ position: 'sticky', top: '0', zIndex: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', padding: '0.5rem 0' }}>
        {!isGlobal && (
          <button className={`${styles.tab} ${tab === 'links' ? styles.active : ''}`} onClick={() => { setTab('links'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <LinkIcon size={18} /> 링크 관리
          </button>
        )}
        <button className={`${styles.tab} ${tab === 'stats' ? styles.active : ''}`} onClick={() => { setTab('stats'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <Activity size={18} /> {isGlobal ? '종합 통계 현황 (실시간)' : '방문자 통계'}
        </button>
      </div>

      {tab === 'links' && !isGlobal && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
               <div className={styles.statNum} style={{color: '#0284c7'}}>{totalLinksCnt}</div>
               <div className={styles.statLabel}>전체 링크</div>
            </div>
            <div className={styles.statCard}>
               <div className={styles.statNum} style={{color: '#16a34a'}}>{activeLinksCnt}</div>
               <div className={styles.statLabel}>활성 링크</div>
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}><Star size={18} fill="#0ea5e9" color="#0ea5e9" /> 주요 서비스</div>
          </div>
          
          <CoreLinkCard id="checklistUrl" title="출항 전 점검표" url={ship.checklistUrl} icon="clipboard" color="navy" editing={editing} setEditing={setEditing} editingVal={editingVal} setEditingVal={setEditingVal} onSave={() => handleSaveCore("checklistUrl")} />
          <CoreLinkCard id="regulationsUrl" title="운항관리규정" url={ship.regulationsUrl} icon="book" color="blue" editing={editing} setEditing={setEditing} editingVal={editingVal} setEditingVal={setEditingVal} onSave={() => handleSaveCore("regulationsUrl")} />
          <CoreLinkCard id="safetyInfoUrl" title="여객선 안전정보" url={ship.safetyInfoUrl} icon="anchor" color="teal" editing={editing} setEditing={setEditing} editingVal={editingVal} setEditingVal={setEditingVal} onSave={() => handleSaveCore("safetyInfoUrl")} />

          <div className={styles.linkCard}>
            <div className={styles.linkLeft}>
               <div className={`${styles.linkIconBox} ${styles.purple}`}><CalendarDays size={24} /></div>
               <div className={styles.linkInfo}>
                 <h4>내일의 운항예보 (알림 메시지)</h4>
                 {editing !== 'weather' ? (
                   <>
                     <p>{config?.tomorrowWeather || '등록된 알림이 없습니다.'}</p>
                     <div className={styles.badges}>
                       <span className={`${styles.badge} ${styles.primary}`}>공통 공지</span>
                       <span className={`${styles.badge} ${styles.active}`}>전선박 적용</span>
                     </div>
                   </>
                 ) : (
                   <div className={styles.editInline}>
                     <textarea 
                        className={styles.editInput} 
                        autoFocus 
                        defaultValue={config?.tomorrowWeather || ''} 
                        onChange={(e)=>setEditingVal(e.target.value)}
                        style={{ width: '100%', minHeight: '80px', padding: '0.75rem' }}
                     />
                     <div style={{display:'flex', gap:'0.5rem', marginTop: '0.5rem'}}>
                       <button className={styles.editSave} onClick={handleSaveWeather}>변경 저장</button>
                       <button className={styles.actionBtn} onClick={()=>setEditing(null)}>취소</button>
                     </div>
                   </div>
                 )}
               </div>
            </div>
            {editing !== 'weather' && (
              <div className={styles.actions}>
                 <button className={styles.actionBtn} onClick={() => { setEditing('weather'); setEditingVal(config?.tomorrowWeather||''); }}><Edit2 size={14}/> 메시지 수정</button>
              </div>
            )}
          </div>

          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}><Target size={18} color="#0ea5e9" /> 편리한 추가 서비스</div>
            <button className={styles.addBtn} onClick={() => {
              const t = prompt('추가할 서비스 이름:');
              if(!t)return;
              const u = prompt('URL 주소 (https://...):');
              if(t&&u) addCustomLink(ship.id, t, u);
            }}><PlusCircle size={16}/> 추가</button>
          </div>

          {ship.links?.filter((l:any)=>l.url!=='tracking-only').map((l:any) => (
             <div className={styles.linkCard} key={l.id}>
               <div className={styles.linkLeft}>
                  <div className={`${styles.linkIconBox} ${styles.pink}`}><ExternalLink size={24} /></div>
                  <div className={styles.linkInfo}>
                    <h4>{l.title}</h4>
                    <p>{l.url}</p>
                    <div className={styles.badges}>
                      <span className={`${styles.badge} ${styles.extra}`}>추가</span>
                      <span className={`${styles.badge} ${styles.active}`}>활성</span>
                    </div>
                  </div>
               </div>
               <div className={styles.actions} style={{ display: 'flex', gap: '0.6rem', padding: '0.4rem 0' }}>
                  <button 
                    className={styles.actionBtn} 
                     onClick={async () => {
                        const input = prompt('제목과 주소를 [제목@주소] 형식으로 입력하세요.\n예시: 안전정보@https://naver.com', `${l.title}@${l.url}`);
                        if (input && input.includes('@')) {
                           const [newTitle, newUrl] = input.split('@');
                           try {
                              if (!newTitle || !newUrl) throw new Error('입력 형식이 잘못되었습니다.');
                              console.log('Update starting...', { newTitle, newUrl });
                              await updateCustomLink(l.id, newTitle, newUrl);
                              alert('수정 완료!');
                              window.location.reload();
                           } catch (err) {
                              alert('수정 중 서버 에러 발생: ' + (err as Error).message);
                              console.error(err);
                           }
                        } else if (input) {
                           alert('입력 시 중간에 @ 문자를 넣어주세요!');
                        }
                     }} 
                    style={{ 
                      color: '#0ea5e9', 
                      backgroundColor: 'rgba(14, 165, 233, 0.1)', 
                      border: '1px solid rgba(14, 165, 233, 0.4)',
                      padding: '0.5rem 1rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit2 size={14}/> 수정
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${styles.danger}`} 
                    onClick={()=>setDeleteConfirmLink(l)}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      borderRadius: '10px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={14}/> 삭제
                  </button>
               </div>
             </div>
          ))}

          {/* Link Deletion Modal */}
          {deleteConfirmLink && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalIcon}><AlertCircle size={32} /></div>
                <div className={styles.modalTitle}>링크 삭제</div>
                <div className={styles.modalDesc}>
                  <strong>[{deleteConfirmLink.title}]</strong> 링크를 삭제하시겠습니까?
                </div>
                <div className={styles.modalActions}>
                  <button className={styles.cancelBtn} onClick={() => setDeleteConfirmLink(null)}>취소</button>
                  <button className={styles.confirmBtn} onClick={executeDeleteLink}>네, 삭제합니다</button>
                </div>
              </div>
            </div>
          )}

          {/* Link Undo Toast */}
          {undoLinkToast && (
            <div className={styles.undoToast}>
              <span style={{ fontSize: '0.9rem' }}>링크가 삭제되었습니다.</span>
              <button className={styles.undoBtn} onClick={handleRestoreLink}>
                <RotateCcw size={14} style={{ marginRight: '0.4rem' }} /> 되돌릴래요!
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'stats' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
               <div className={`${styles.statIcon} ${styles.blue}`}><User size={20}/></div>
               <div className={styles.statNum}>{overallStats.today}</div>
               <div className={styles.statLabel}>오늘 전체 방문</div>
            </div>
            <div className={styles.statCard}>
               <div className={`${styles.statIcon} ${styles.green}`}><Calendar size={20}/></div>
               <div className={styles.statNum}>{overallStats.yesterday}</div>
               <div className={styles.statLabel}>어제 전체 방문</div>
            </div>
            <div className={styles.statCard}>
               <div className={`${styles.statIcon} ${styles.purple}`}><CalendarDays size={20}/></div>
               <div className={styles.statNum}>{overallStats.week}</div>
               <div className={styles.statLabel}>최근 7일 합계</div>
            </div>
            <div className={styles.statCard} style={{ border: '2px solid rgba(255, 77, 77, 0.3)', background: 'rgba(255, 77, 77, 0.05)' }}>
               <div className={`${styles.statIcon}`} style={{ background: '#ff4d4d', color: '#fff' }}><Heart size={20} fill="#fff"/></div>
               <div className={styles.statNum} style={{ color: '#ff4d4d' }}>{isGlobal ? overallStats.totalFavorites : (ship.favoriteCount || 0)}</div>
               <div className={styles.statLabel} style={{ color: '#ff4d4d', fontWeight: 700 }}>{isGlobal ? '전체 즐겨찾기' : '이 배를 찜한 사람'}</div>
            </div>
            <div className={styles.statCard}>
               <div className={`${styles.statIcon} ${styles.teal}`}><Users size={20}/></div>
               <div className={styles.statNum}>{overallStats.total}</div>
               <div className={styles.statLabel}>총 누적 방문</div>
            </div>
          </div>

          <div className={styles.chartCard} style={{ marginBottom: isGlobal ? '2rem' : '1.5rem' }}>
             <div className={styles.chartHeader}><BarChart2 size={18}/> {isGlobal ? '센터 전체' : ship.name} 최근 7일 방문 트렌드</div>
             <div className={styles.barChart}>
               {overallStats.chart?.map((day:any, i:number) => (
                 <div className={styles.barCol} key={i}>
                   <div className={styles.barVal}>{day.count}</div>
                   <div className={`${styles.barFill} ${i===6 ? styles.today : (day.count>0?styles.active:'')}`} style={{height: `${Math.max((day.count/(overallStats.maxVisit||1))*100, 5)}%`}}></div>
                   <div className={styles.barLabel}>{day.date}</div>
                 </div>
               ))}
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isGlobal ? '1fr 1fr' : '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {isGlobal && overallStats.shipFavoriteRank && (
              <div className={styles.chartCard} style={{ borderTop: '4px solid #ff4d4d' }}>
                 <div className={styles.chartHeader}><Heart size={18} fill="#ff4d4d" color="#ff4d4d"/> 즐겨찾기 인기 순위 (TOP 10)</div>
                 <div className={styles.rankList}>
                   {overallStats.shipFavoriteRank.map((s:any, i:number) => {
                     const maxFavs = overallStats.shipFavoriteRank[0]?.favorites || 1;
                     return (
                     <div className={styles.rankItem} key={i}>
                       <div className={styles.rankMedal} style={{ background: i < 3 ? '#ff4d4d' : '#94a3b8' }}>{i+1}</div>
                       <div className={styles.rankInfo}>
                          <div className={styles.rankTitle}>
                             {s.name} <span className={styles.rankNum} style={{color: '#ff4d4d'}}>{s.favorites}명 찜</span>
                          </div>
                          <div className={styles.progressTrack}>
                             <div className={styles.progressFill} style={{width: `${Math.max((s.favorites/maxFavs)*100, 2)}%`, background: '#ff4d4d'}}></div>
                          </div>
                       </div>
                     </div>
                   )})}
                   {overallStats.shipFavoriteRank.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>아직 즐겨찾기 데이터가 없습니다.</p>}
                 </div>
              </div>
            )}

            {isGlobal && overallStats.shipRank && (
              <div className={styles.chartCard}>
                 <div className={styles.chartHeader}><ShipIcon size={18}/> 방문자 많은 선박 순위 (TOP 10)</div>
                 <div className={styles.rankList}>
                   {overallStats.shipRank.map((s:any, i:number) => {
                     const maxVisits = overallStats.shipRank[0]?.visits || 1;
                     return (
                     <div className={styles.rankItem} key={i}>
                       <div className={styles.rankMedal}>{i+1}</div>
                       <div className={styles.rankInfo}>
                          <div className={styles.rankTitle}>
                             {s.name} <span className={styles.rankNum}>{s.visits}회 방문</span>
                          </div>
                          <div className={styles.progressTrack}>
                             <div className={styles.progressFill} style={{width: `${Math.max((s.visits/maxVisits)*100, 2)}%`, background: '#238299'}}></div>
                          </div>
                       </div>
                     </div>
                   )})}
                 </div>
              </div>
            )}
          </div>

          <div className={styles.chartCard}>
             <div className={styles.chartHeader}><BarChart2 size={18} style={{transform:'rotate(90deg)'}}/> {isGlobal ? '전체 선박' : ship.name} 링크 클릭 순위 <span style={{marginLeft:'auto', fontSize:'0.8rem', color:'#94a3b8', fontWeight:'normal'}}>총 {overallStats.totalClicks}회</span></div>
             <div className={styles.rankList}>
               {overallStats.rank?.map((r:any, i:number) => {
                 const is1 = i===0; const is2 = i===1; const is3 = i===2;
                 const medalClass = is1 ? styles.g : is2 ? styles.s : is3 ? styles.b : styles.n;
                 const fillClass = is1 ? styles.c1 : is2 ? styles.c2 : is3 ? styles.c3 : styles.cn;
                 return (
                 <div className={styles.rankItem} key={i}>
                   <div className={`${styles.rankMedal} ${medalClass}`}>{i+1}</div>
                   <div className={styles.rankInfo}>
                      <div className={styles.rankTitle}>
                         {r.title} <span className={styles.rankNum}>{r.clicks}회</span>
                      </div>
                      <div className={styles.progressTrack}>
                         <div className={`${styles.progressFill} ${fillClass}`} style={{width: `${Math.max((r.clicks/overallStats.maxClick)*100, 2)}%`}}></div>
                      </div>
                   </div>
                 </div>
               )})}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CoreLinkCard({ id, title, url, icon, color, editing, setEditing, editingVal, setEditingVal, onSave }: any) {
  const isEditing = editing === id;
  return (
    <div className={styles.linkCard}>
      <div className={styles.linkLeft}>
         <div className={`${styles.linkIconBox} ${styles[color]}`}><LinkIcon size={24} /></div>
         <div className={styles.linkInfo}>
           <h4>{title}</h4>
           {!isEditing && (
             <>
               <p>{url || '연결된 주소가 없습니다.'}</p>
               <div className={styles.badges}>
                 <span className={`${styles.badge} ${styles.primary}`}>주요</span>
                 {url && <span className={`${styles.badge} ${styles.active}`}>활성</span>}
               </div>
             </>
           )}
           {isEditing && (
             <div className={styles.editInline}>
               <input type="text" className={styles.editInput} autoFocus defaultValue={url||''} onChange={(e:any)=>setEditingVal(e.target.value)} placeholder="URL 입력" />
               <div style={{display:'flex',gap:'0.5rem'}}>
                 <button className={styles.editSave} onClick={onSave}>저장</button>
                 <button className={`${styles.actionBtn}`} onClick={()=>setEditing(null)}>취소</button>
               </div>
             </div>
           )}
         </div>
      </div>
      {!isEditing && (
        <div className={styles.actions}>
           <button className={styles.actionBtn} onClick={()=>{setEditing(id);setEditingVal(url||'');}}><Edit2 size={14}/> 수정</button>
           {url && <button className={`${styles.actionBtn} ${styles.danger}`} onClick={()=>{setEditingVal('');setTimeout(onSave,10);}}><Trash2 size={14}/> 삭제</button>}
        </div>
      )}
    </div>
  );
}
