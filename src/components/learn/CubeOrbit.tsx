"use client";
import {useEffect,useRef,useState} from 'react';
import type {Heights,SymbolName} from '@/data/grade-six-cubes';
type V=[number,number,number];
type Face={points:V[];normal:V;fill:string;symbol?:SymbolName};
const dot=(a:V,b:V)=>a.reduce((s,n,i)=>s+n*b[i],0);
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
function symbol(name:SymbolName):[number,number][]{if(name==='Persegi')return [[.25,.25],[.75,.25],[.75,.75],[.25,.75]];if(name==='Segitiga')return [[.5,.2],[.8,.76],[.2,.76]];const n=name==='Bintang'?10:32;return Array.from({length:n},(_,i)=>{const r=name==='Bintang'?(i%2?.14:.32):.27,t=-Math.PI/2+i*Math.PI*2/n;return [.5+r*Math.cos(t),.5+r*Math.sin(t)];});}
export default function CubeOrbit({heights:h,layer=0,dice}:{heights:Heights;layer?:number;dice?:{front:SymbolName;right:SymbolName;top:SymbolName}}){
 const [yaw,setYaw]=useState(45),[pitch,setPitch]=useState(28),[zoom,setZoom]=useState(1),[dragging,setDragging]=useState(false);
 const viewport=useRef<SVGSVGElement>(null),pointers=useRef(new Map<number,{x:number;y:number}>()),pinch=useRef(0);
 useEffect(()=>{const el=viewport.current;if(!el)return;const wheel=(e:WheelEvent)=>{e.preventDefault();setZoom(z=>clamp(z*Math.exp(-e.deltaY*.0015),.65,2.2));};el.addEventListener('wheel',wheel,{passive:false});return ()=>el.removeEventListener('wheel',wheel);},[]);
 const nx=h[0].length,ny=h.length,max=Math.max(1,...h.flat()),a=yaw*Math.PI/180,b=pitch*Math.PI/180;
 const camera:V=[Math.sin(a)*Math.cos(b),-Math.cos(a)*Math.cos(b),Math.sin(b)],right:V=[Math.cos(a),Math.sin(a),0],up:V=[-Math.sin(a)*Math.sin(b),Math.cos(a)*Math.sin(b),Math.cos(b)];
 const center:V=[nx/2,ny/2,max/2],scale=220/(Math.max(nx,ny,max)+1)*zoom;
 const screen=(p:V)=>{const v=p.map((n,i)=>n-center[i]) as V;return [dot(v,right)*scale,-dot(v,up)*scale];};
 const has=(x:number,y:number,z:number)=>x>=0&&x<nx&&y>=0&&y<ny&&z>=0&&z<h[y][x]&&(!layer||z===layer-1);
 const faces:Face[]=[];
 const colors=[['#a7f3d0','#34d399','#059669'],['#bae6fd','#38bdf8','#0284c7'],['#fed7aa','#fb923c','#c2410c']];
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)for(let z=0;z<h[y][x];z++)if(!layer||z===layer-1){const col=dice?['#f1f5f9','#d1dce2','#e2e8f0']:colors[z%3];
  const add=(normal:V,points:V[],fill:string,mark?:SymbolName)=>{if(dot(normal,camera)>.00001)faces.push({normal,points,fill,symbol:mark});};
  if(!has(x,y-1,z))add([0,-1,0],[[x,y,z+1],[x+1,y,z+1],[x+1,y,z],[x,y,z]],col[1],dice?.front);
  if(!has(x+1,y,z))add([1,0,0],[[x+1,y,z+1],[x+1,y+1,z+1],[x+1,y+1,z],[x+1,y,z]],col[2],dice?.right);
  if(!has(x,y,z+1))add([0,0,1],[[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]],col[0],dice?.top);
  if(!has(x-1,y,z))add([-1,0,0],[[x,y+1,z+1],[x,y,z+1],[x,y,z],[x,y+1,z]],col[2]);
  if(!has(x,y+1,z))add([0,1,0],[[x+1,y+1,z+1],[x,y+1,z+1],[x,y+1,z],[x+1,y+1,z]],col[1]);
  if(!has(x,y,z-1))add([0,0,-1],[[x,y,z],[x+1,y,z],[x+1,y+1,z],[x,y+1,z]],col[0]);
 }
 const depth=(f:Face)=>dot(f.points.reduce((v,p)=>v.map((n,i)=>n+p[i]/4) as V,[0,0,0] as V),camera);
 faces.sort((f,g)=>depth(f)-depth(g));
 const points=(p:V[])=>p.map(v=>screen(v).join(',')).join(' ');
 const end=(id:number)=>{pointers.current.delete(id);pinch.current=0;setDragging(pointers.current.size>0);};
 const reset=()=>{setYaw(45);setPitch(28);setZoom(1);};
 return <div className="space-y-2 rounded-xl border border-success/30 bg-base-100 p-2" data-testid="cube-orbit">
  <p className="text-xs font-bold">Model 3D · seret untuk memutar</p>
  <svg ref={viewport} viewBox="-200 -165 400 330" className={`h-72 w-full rounded-lg bg-info/5 outline-none focus:ring-2 focus:ring-success ${dragging?'cursor-grabbing':'cursor-grab'}`} style={{touchAction:'none'}} role="group" tabIndex={0} aria-label="Model kubus 3D. Seret mouse atau jari untuk memutar. Tombol panah memutar; tambah dan kurang untuk zoom." data-yaw={yaw.toFixed(2)} data-pitch={pitch.toFixed(2)} data-zoom={zoom.toFixed(2)}
   onPointerDown={e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});pinch.current=0;if(pointers.current.size===2){const [p,q]=[...pointers.current.values()];pinch.current=Math.hypot(p.x-q.x,p.y-q.y);}setDragging(true);}}
   onPointerMove={e=>{const old=pointers.current.get(e.pointerId);if(!old)return;pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.current.size===2){const [p,q]=[...pointers.current.values()],d=Math.hypot(p.x-q.x,p.y-q.y);const previous=pinch.current;if(previous>0)setZoom(z=>clamp(z*d/previous,.65,2.2));pinch.current=d;}else if(pointers.current.size===1){setYaw(v=>(v+(e.clientX-old.x)*.55)%360);setPitch(v=>clamp(v+(e.clientY-old.y)*.45,-75,90));}}}
   onPointerUp={e=>end(e.pointerId)} onPointerCancel={e=>end(e.pointerId)} onLostPointerCapture={e=>end(e.pointerId)}
   onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')setYaw(v=>v-15);if(e.key==='ArrowRight')setYaw(v=>v+15);if(e.key==='ArrowUp')setPitch(v=>clamp(v+15,-75,90));if(e.key==='ArrowDown')setPitch(v=>clamp(v-15,-75,90));if(e.key==='+'||e.key==='=')setZoom(v=>clamp(v*1.15,.65,2.2));if(e.key==='-')setZoom(v=>clamp(v/1.15,.65,2.2));if(e.key==='Home')reset();}}}>
   {faces.map((f,i)=><g key={i}><polygon points={points(f.points)} fill={f.fill} stroke="#24584e" strokeWidth="1.2" strokeLinejoin="round"/>{f.symbol&&(()=>{const at=(u:number,v:number)=>f.points[0].map((n,j)=>n+u*(f.points[1][j]-n)+v*(f.points[3][j]-n)) as V;if(f.symbol==='P'){const p=screen(at(.5,.6));return <text x={p[0]} y={p[1]} textAnchor="middle" fill="#173d33" fontSize={scale*.45} fontWeight="bold">P</text>;}return <polygon points={points(symbol(f.symbol).map(([u,v])=>at(u,v)))} fill="#173d33"/>;})()}</g>)}
   {([['DEPAN',[nx/2,-.45,0]],['KANAN',[nx+.45,ny/2,0]]] as [string,V][]).map(([label,p])=>{const [x,y]=screen(p);return <g key={label}><circle cx={x} cy={y} r="3" fill="#164c3c"/><text x={x} y={y+14} textAnchor="middle" fontSize="11" fontWeight="900" fill="#164c3c" stroke="white" strokeWidth="3" paintOrder="stroke">{label}</text></g>;})}
  </svg>
  <div className="flex flex-wrap gap-1">{[['Depan',0,0],['Kanan',90,0],['Atas',0,90]].map(([name,y,p])=><button key={name} type="button" className="btn btn-outline btn-xs min-h-9" onClick={()=>{setYaw(Number(y));setPitch(Number(p));}}>{name} 3D</button>)}<button type="button" className="btn btn-outline btn-xs min-h-9" aria-label="Perbesar model" onClick={()=>setZoom(z=>clamp(z*1.2,.65,2.2))}>＋</button><button type="button" className="btn btn-outline btn-xs min-h-9" aria-label="Perkecil model" onClick={()=>setZoom(z=>clamp(z/1.2,.65,2.2))}>−</button><button type="button" className="btn btn-success btn-xs min-h-9" onClick={reset}>Reset posisi</button></div>
  <p className="text-xs text-base-content/70">Gulir mouse atau cubit dengan dua jari untuk zoom. Kamera bergerak; susunan, acuan arah, dan jawaban soal tetap sama.{dice?' Sisi yang tidak diperlihatkan pada soal dibiarkan tanpa lambang.':''}</p>
 </div>;
}
