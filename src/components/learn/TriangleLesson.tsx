"use client";

import { useState } from "react";
import { shapes } from "@/data/grade-four-geometry";

const examples = ["isosceles", "equilateral", "scalene", "right", "obtuse"];
const groups = [
  { title: "A. Berdasarkan panjang sisi", items: [
    { label: "Sama kaki", id: "isosceles", text: "Memiliki dua sisi sama panjang. Dua sudut yang berhadapan dengan sisi tersebut juga sama besar." },
    { label: "Sama sisi", id: "equilateral", text: "Ketiga sisinya sama panjang. Ketiga sudutnya sama besar, masing-masing 60°." },
    { label: "Sembarang", id: "scalene", text: "Ketiga sisinya berbeda panjang. Ketiga sudutnya juga berbeda besar." },
  ] },
  { title: "B. Berdasarkan besar sudut", items: [
    { label: "Siku-siku", id: "right", text: "Memiliki satu sudut tepat 90°. Dua sudut lainnya lancip." },
    { label: "Lancip", id: "equilateral", text: "Ketiga sudutnya kurang dari 90°. Semua sudut harus diperiksa, bukan hanya satu." },
    { label: "Tumpul", id: "obtuse", text: "Memiliki satu sudut lebih dari 90°. Dua sudut lainnya lancip." },
  ] },
];

export function TriangleExplanation() {
  return <div className="mt-3 space-y-5">
    <p>Segitiga memiliki 3 sisi dan 3 titik sudut. Jumlah ketiga sudutnya adalah 180°. Kita dapat mengelompokkannya dengan dua cara.</p>
    {groups.map(group => <section key={group.title}>
      <h3 className="font-bold text-success">{group.title}</h3>
      <ul className="mt-2 list-disc space-y-3 pl-5">{group.items.map(item => <li key={item.label}><strong>Segitiga {item.label.toLowerCase()}:</strong> {item.text}</li>)}</ul>
    </section>)}
    <p className="rounded-lg bg-info/10 p-3"><strong>Dua cara melihat bangun yang sama.</strong> Segitiga sama kaki dapat sekaligus siku-siku. Segitiga sama sisi selalu lancip. Segitiga sembarang dapat lancip, siku-siku, atau tumpul.</p>
    <p className="text-sm">Catatan: segitiga sama sisi juga memenuhi sifat memiliki setidaknya dua sisi sama panjang. Di sini kita memakai nama yang lebih khusus, yaitu sama sisi.</p>
    <p><strong>Coba sendiri:</strong> pilih jenis segitiga, periksa tanda pada sisinya dan besar sudutnya, lalu putar gambar. Apakah kedua kelompoknya berubah?</p>
  </div>;
}

export default function TriangleLab() {
  const [id, setId] = useState("right");
  const [rotation, setRotation] = useState(0);
  const [details, setDetails] = useState(true);
  const points = shapes[id].points!;
  const lengths = points.map((p, i) => Math.hypot(p[0] - points[(i + 1) % 3][0], p[1] - points[(i + 1) % 3][1]));
  const equal = (a: number, b: number) => Math.abs(a - b) < 0.001;
  const sides = equal(lengths[0], lengths[1]) && equal(lengths[1], lengths[2]) ? "Sama sisi" : lengths.some((v, i) => lengths.some((w, j) => i !== j && equal(v, w))) ? "Sama kaki" : "Sembarang";
  const angles = points.map((p, i) => {
    const a = points[(i + 1) % 3], b = points[(i + 2) % 3];
    const dot = (a[0]-p[0])*(b[0]-p[0])+(a[1]-p[1])*(b[1]-p[1]);
    return Math.acos(Math.max(-1, Math.min(1, dot / (Math.hypot(a[0]-p[0],a[1]-p[1])*Math.hypot(b[0]-p[0],b[1]-p[1]))))) * 180 / Math.PI;
  });
  const angleType = angles.some(a => equal(a,90)) ? "Siku-siku" : angles.some(a => a > 90) ? "Tumpul" : "Lancip";
  const centre = points.reduce((s,p) => [s[0]+p[0]/3,s[1]+p[1]/3], [0,0]);
  return <div className="space-y-4">
    {groups.map(group => <fieldset key={group.title}>
      <legend className="mb-2 font-bold">{group.title}</legend>
      <div className="flex flex-wrap gap-2">{group.items.map(item => <button key={item.label} className="btn btn-sm btn-outline" onClick={() => setId(item.id)} aria-label={`Coba segitiga ${item.label.toLowerCase()}`}>{item.label}</button>)}</div>
    </fieldset>)}
    <label className="block font-bold">Pilih contoh gabungan<select className="select select-bordered mt-2 w-full" value={id} onChange={e => setId(e.target.value)}>{examples.map(key => <option key={key} value={key}>{shapes[key].name}</option>)}</select></label>
    <svg viewBox="-20 -20 240 240" className="mx-auto w-full max-w-72" role="img" aria-label={`Segitiga ${sides.toLowerCase()} dan ${angleType.toLowerCase()}`}>
      <g transform={`rotate(${rotation} 100 100)`}>
        <polygon points={points.map(p=>p.join(",")).join(" ")} fill="#a7f3d0" stroke="#065f46" strokeWidth="3"/>
        {details && points.map((p,i) => {
          const q = points[(i+1)%3];
          const dx=(q[0]-p[0])/lengths[i], dy=(q[1]-p[1])/lengths[i];
          const matches=lengths.some((n,j)=>j!==i && equal(n,lengths[i]));
          const x=(p[0]+q[0])/2, y=(p[1]+q[1])/2;
          const ax=p[0]*.7+centre[0]*.3, ay=p[1]*.7+centre[1]*.3;
          return <g key={i}>
            {matches && <line x1={x-dy*6} y1={y+dx*6} x2={x+dy*6} y2={y-dx*6} stroke="#065f46" strokeWidth="3"/>}
            <text x={ax} y={ay} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${-rotation} ${ax} ${ay})`} fontSize="12" fontWeight="bold" fill="#064e3b">{Math.round(angles[i])}°</text>
          </g>;
        })}
      </g>
    </svg>
    <p className="text-sm">Tanda garis yang sama menunjukkan sisi sama panjang. Besar sudut pada gambar dibulatkan ke derajat terdekat.</p>
    <div className="flex flex-wrap gap-2"><button className="btn btn-sm btn-outline" onClick={() => setRotation((rotation+45)%360)}>Putar 45°</button><button className="btn btn-sm btn-outline" onClick={() => setDetails(!details)}>{details ? "Sembunyikan tanda" : "Tampilkan tanda sisi dan sudut"}</button></div>
    <div aria-live="polite" className="space-y-2 rounded-lg bg-base-100 p-3">
      <p><strong>Berdasarkan sisi:</strong> <span data-testid="triangle-sides">{sides}</span></p>
      <p><strong>Berdasarkan sudut:</strong> <span data-testid="triangle-angles">{angleType}</span></p>
      <p>{shapes[id].facts}</p><p>Diputar {rotation}°: sifat tetap sama.</p>
    </div>
  </div>;
}
