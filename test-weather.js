async function test() {
  const authKey = 'UdZArTR1TE6WQK00dUxOnQ';
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  // 시간을 오늘 오전 05시 또는 11시로 맞춰봅니다 (기상청 단기예보 주요 시간)
  const tm = `${yyyy}${mm}${dd}1100`; 
  
  const url = `https://apihub.kma.go.kr/api/typ01/url/fct_afs_do.php?tmfc=${tm}&authKey=${authKey}`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`--- Result for tmfc=${tm} ---`);
    console.log(text.slice(0, 1000));
  } catch (e) {
    console.error(e);
  }
}
test();
