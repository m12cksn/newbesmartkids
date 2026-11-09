"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BrandMark } from '@/components/home/BrandMark';
import { LEVELS, wibDate, dailyQuestions, correctAnswer, questionLabel, readPractice, storageKey, type Level, type SavedPractice } from '@/lib/daily-arithmetic';
import styles from './DailyMastering.module.css';
const empty = (date:string):SavedPractice => ({date,answers:Array(7).fill(''),checked:false});
function LevelIcon({level}:{level:number}) { return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{level===1?<><path d="M12 21V10M12 16C3 16 3 8 3 8s9-1 9 8ZM12 11c0-8 9-8 9-8s1 9-9 9"/></>:level===2?<><path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></>:<><path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/></>}</svg> }
export default function DailyMastering({level}:{level:Level}) {
  const [practice,setPractice] = useState<SavedPractice|null>(null);
  const [today,setToday] = useState('');
  const [storageAvailable,setStorageAvailable] = useState(true);
  const [hint,setHint] = useState<number|null>(null);
  const [notice,setNotice] = useState('');
  useEffect(() => {
    const day=wibDate(); setToday(day);
    let saved:SavedPractice|null=null;
    try { saved=readPractice(localStorage.getItem(storageKey(level))); } catch { setStorageAvailable(false); }
    setPractice(saved && (saved.date===day || saved.answers.some(Boolean)) ? saved : empty(day));
    const refresh=()=>setToday(wibDate());
    const timer=setInterval(refresh,1000);
    window.addEventListener('focus',refresh); document.addEventListener('visibilitychange',refresh);
    return ()=>{clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
  },[level]);
  useEffect(() => {
    if (!practice) return;
    try { localStorage.setItem(storageKey(level),JSON.stringify(practice)); } catch { setStorageAvailable(false); }
  },[practice,level]);
  const info=LEVELS[level-1];
  const questions=practice?dailyQuestions(practice.date,level):[];
  const filled=practice?.answers.filter(Boolean).length??0;
  const correct=practice?questions.filter((q,i)=>correctAnswer(practice.answers[i],q.answer)).length:0;
  const dateText=practice?new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Jakarta'}).format(new Date(practice.date+'T00:00:00+07:00')):'';
  function startToday(){setPractice(empty(wibDate()));setToday(wibDate());setHint(null);setNotice('Paket hari ini siap. Selamat berlatih!');}
  return <main className={styles.page} data-theme="besmartkids">
    <div className={styles.ornaments} aria-hidden="true"><span>×</span><span>÷</span><span>+</span><span>=</span><span>△</span></div>
    <header className={styles.header}><Link href="/" aria-label="Beranda BeSmartKids"><BrandMark/></Link><Link href="/" className={styles.back}>← Beranda</Link></header>
    <div className={styles.content}>
      <section className={styles.intro}><div className={styles.eyebrow}><span/> SEDIKIT SETIAP HARI, MAKIN MAHIR</div><h1>Mastering<br/><span>Perkalian &amp; Pembagian</span></h1><p>Temukan angka yang hilang. Tujuh langkah kecil untuk pikiran yang makin lincah.</p></section>
      <nav className={styles.levels} aria-label="Pilih level latihan">{LEVELS.map(l=><Link key={l.id} href={`/mastering-perkalian-pembagian/level-${l.id}`} aria-current={l.id===level?'page':undefined} className={l.id===level?styles.activeLevel:''}><LevelIcon level={l.id}/><span><strong>Level {l.id}</strong><small>{l.name}</small></span></Link>)}</nav>
      <div className={styles.workspace}>
        <aside className={styles.side}><div className={styles.levelBadge}><LevelIcon level={level}/> LEVEL {level} · {info.name.toUpperCase()}</div><h2>Satu kotak.<br/>Satu penemuan.</h2><p>{info.description} {info.detail}</p><div className={styles.tip}><span aria-hidden="true">× ↔ ÷</span><h3>Dua operasi, satu hubungan</h3><p>Jika 3 × 4 = 12, maka 12 ÷ 4 = 3. Gunakan hubungan ini untuk mencari bagian yang kosong.</p></div><p className={styles.dailyNote}>◷ Paket baru setiap 00.00 WIB.<br/>Soal tetap sama sepanjang hari.</p></aside>
        <section className={styles.paper} aria-label="Lembar latihan harian">
          <div className={styles.paperTop}><div><p className={styles.kicker}>{practice&&practice.date!==today?'Paket sebelumnya':'Latihan hari ini'}</p><h2>{dateText||'Menyiapkan latihan…'}</h2></div><span className={styles.seven}>7 soal</span></div>
          {practice&&practice.date!==today&&<div className={styles.newDay} role="status"><strong>Paket hari baru sudah tersedia.</strong><p>Jawaban paket ini tetap tersimpan. Beralih akan membuka lembar baru untuk level ini.</p><button type="button" onClick={startToday}>Mulai paket hari ini →</button></div>}
          {!storageAvailable&&<p className={styles.warning} role="status">Penyimpanan perangkat tidak tersedia. Jawaban tetap bisa diperiksa, tetapi tidak tersimpan setelah halaman ditutup.</p>}
          {practice?<form onSubmit={e=>{e.preventDefault();if(filled===7){setPractice({...practice,checked:true});setNotice('');}}}>
            <div className={styles.progressLabel}><span>Isi kotak yang kosong</span><span>{filled}/7 terisi</span></div><progress className={styles.progress} value={filled} max={7} aria-label="Soal terisi"/>
            <ol className={styles.rows}>{questions.map((q,i)=>{
              const good=correctAnswer(practice.answers[i],q.answer), reviewed=practice.checked;
              return <li className={styles.row} key={`${practice.date}-${i}`} data-testid={`question-${i}`}><span className={styles.number}>{String(i+1).padStart(2,'0')}</span><div className={styles.rowBody}><div className={styles.equation}>
                {[q.left,q.right,q.result].map((value,j)=><span key={j} className={styles.term}>{j>0&&<span aria-hidden="true" className={styles.operator}>{j===1?q.operator:'='}</span>}{q.blank===j?<input aria-label={`Jawaban soal ${i+1}: ${questionLabel(q)}`} aria-describedby={reviewed?`feedback-${i}`:undefined} aria-invalid={reviewed&&!good} className={`${styles.answer} ${reviewed?(good?styles.good:styles.wrong):''}`} type="text" inputMode="numeric" pattern="[0-9]{1,4}" maxLength={4} autoComplete="off" required value={practice.answers[i]} onChange={e=>{const v=e.target.value;if(!/^\d{0,4}$/.test(v))return;setPractice({...practice,answers:practice.answers.map((a,k)=>k===i?v:a),checked:false});setHint(null);setNotice('');}}/>:<span className={styles.given}>{value}</span>}</span>)}
              </div>{reviewed&&<div id={`feedback-${i}`} className={styles.feedback}>{good?<span>✓ Tepat!</span>:<><span>↻ Coba lagi</span><button type="button" onClick={()=>setHint(hint===i?null:i)} aria-expanded={hint===i}>Petunjuk</button>{hint===i&&<p>Gunakan keluarga fakta: {q.fact[0]} × {q.fact[1]} = {q.fact[0]*q.fact[1]}. Jadi {q.fact[0]*q.fact[1]} ÷ {q.fact[1]} = {q.fact[0]}.</p>}</>}</div>}</div></li>;
            })}</ol>
            {practice.checked&&<div className={styles.result} role="status"><strong>{correct===7?'Hebat, lengkap dan tepat!':'Bagus, lanjutkan usahamu!'}</strong><p>Benar {correct} · Perlu diperbaiki {7-correct} · Skor {Math.round(correct/7*100)}/100</p>{correct<7&&<small>Ubah jawaban yang belum tepat, lalu periksa kembali.</small>}</div>}
            <button type="submit" className={styles.check} disabled={filled<7}>Periksa jawaban <span aria-hidden="true">→</span></button>
            <div className={styles.bottom}><span>{filled<7?'Lengkapi 7 jawaban untuk memeriksa.':storageAvailable?'Jawaban tersimpan di perangkat ini.':'Siap diperiksa.'}</span>{practice.checked&&<button type="button" onClick={()=>{setPractice(empty(practice.date));setHint(null);setNotice('Jawaban dikosongkan. Soal hari ini tetap sama.');}}>Ulangi paket ini</button>}</div>
          </form>:<p role="status" className={styles.loading}>Menyiapkan tujuh soal untukmu…</p>}
          {notice&&<p role="status" className={styles.notice}>{notice}</p>}
        </section>
      </div>
      <footer className={styles.footer}>BeSmartKids <span>·</span> Belajar sedikit demi sedikit, paham lebih lama.</footer>
    </div>
  </main>;
}
