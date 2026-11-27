const BL=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],COL=['#1f7a8c','#8fa398','#e0a526','#c0392b'],KAT=['Relatif Murah','Normal','Relatif Mahal','Sangat Mahal'];
const KC={'Bawang Merah':'#e0529c','Bawang Putih':'#3b5bdb','Beras':'#e8590c','Daging Ayam':'#7048e8','Telur':'#12a594'};
const $=i=>document.getElementById(i),cat=v=>v<D.T[0]?0:v<D.T[1]?1:v<D.T[2]?2:3,lab=id=>BL[id%100-1].slice(0,3)+' '+Math.floor(id/100),rp=v=>'Rp'+Math.round(v).toLocaleString('id-ID'),f2=v=>v.toFixed(2).replace('.',',');
const gids=Object.keys(D.G).map(Number),last=gids[gids.length-1],lastA=D.ids.filter((i,x)=>D.F.Beras.a[x]!=null).pop();
let S={t:Math.floor(last/100),b:last%100,k:'Beras'},ch={};
const years=[...new Set(D.ids.map(i=>Math.floor(i/100)))];
$('ft').innerHTML=years.map(y=>`<option ${y==S.t?'selected':''}>${y}</option>`).join('');
function fillB(){const ms=gids.filter(i=>Math.floor(i/100)==S.t).map(i=>i%100);$('fb').innerHTML='<option value="0">Semua (rata-rata tahun)</option>'+ms.map(m=>`<option value="${m}">${BL[m-1]}</option>`).join('');S.b=ms.includes(S.b)?S.b:0;$('fb').value=S.b}
$('fk').innerHTML=D.K.map(k=>`<button data-k="${k}" aria-pressed="${k==S.k}">${k}</button>`).join('');
$('ft').onchange=e=>{S.t=+e.target.value;fillB();draw()};$('fb').onchange=e=>{S.b=+e.target.value;draw()};
$('fk').onclick=e=>{if(e.target.dataset.k){S.k=e.target.dataset.k;[...$('fk').children].forEach(b=>b.setAttribute('aria-pressed',b.dataset.k==S.k));draw()}};
function idx(){const sel=gids.filter(i=>Math.floor(i/100)==S.t&&(!S.b||i%100==S.b));return D.P.map((p,j)=>{const v=sel.map(i=>D.G[i][j]).filter(x=>x!=null);return v.length?v.reduce((a,b)=>a+b)/v.length/100:null})}
function mk(id,cfg){if(ch[id])ch[id].destroy();const c=getComputedStyle(document.documentElement);Chart.defaults.color=c.getPropertyValue('--mut');Chart.defaults.borderColor=c.getPropertyValue('--line');ch[id]=new Chart($(id),cfg)}
function draw(){
const v=idx(),ok=v.map((x,j)=>[x,j]).filter(a=>a[0]!=null).sort((a,b)=>a[0]-b[0]),avg=ok.reduce((s,a)=>s+a[0],0)/ok.length,mahal=ok.filter(a=>a[0]>=D.T[1]).length;
const ids=D.ids.filter(i=>Math.floor(i/100)==S.t&&(!S.b||i%100==S.b));const F=D.F[S.k];
const cvs=ids.map(i=>F.cv[D.ids.indexOf(i)]).filter(x=>x!=null),pr=ids.map(i=>F.a[D.ids.indexOf(i)]).filter(x=>x!=null);
const cvm=cvs.length?cvs.reduce((a,b)=>a+b)/cvs.length:null,prm=pr.length?pr.reduce((a,b)=>a+b)/pr.length:null;
const kp=(t,x,c)=>`<div class="card"><small>${t}</small><div class="v" ${c?`style="color:${c}"`:''}>${x}</div></div>`;
$('kpi').innerHTML=kp('Indeks Gabungan Nasional',f2(avg),COL[cat(avg)])+kp('Provinsi Termurah',D.P[ok[0][1]][0],null)+kp('Provinsi Termahal',D.P[ok[ok.length-1][1]][0],null)+kp('Disparitas '+S.k+' (CV)',cvm==null?'-':f2(cvm),null)+kp('Provinsi Relatif/Sangat Mahal',mahal+' dari '+ok.length,COL[2])+kp('Harga Nasional '+S.k,prm==null?'-':rp(prm),null);
// peta
CV=v;paintMap(v,-1);
$('tip').textContent='Arahkan kursor atau ketuk provinsi untuk melihat detail.';
$('leg').innerHTML=KAT.map((k,i)=>`<span><i style="background:${COL[i]}"></i>${k}</span>`).join('');
// rank
const mx=Math.max(...ok.map(a=>a[0])),row=a=>`<div><b>${D.P[a[1]][0]}</b><span style="width:${a[0]/mx*55}%;background:${COL[cat(a[0])]}"></span>${f2(a[0])}</div>`;
$('rk').innerHTML='<small style="color:var(--mut)">Termurah</small>'+ok.slice(0,5).map(row).join('')+'<small style="color:var(--mut)">Termahal</small>'+ok.slice(-5).reverse().map(row).join('');
// tren nasional
mk('c1',{type:'line',data:{labels:D.ids.filter(i=>i<=lastA).map(lab),datasets:D.K.map(k=>({label:k,data:D.F[k].a.slice(0,D.ids.indexOf(lastA)+1),borderColor:KC[k],borderWidth:k==S.k?3.5:1.3,pointRadius:0,tension:.3,spanGaps:true}))},options:{maintainAspectRatio:false,interaction:{mode:'index',intersect:false},scales:{x:{ticks:{maxTicksLimit:10}},y:{ticks:{callback:v=>'Rp'+v/1000+'K'}}},plugins:{tooltip:{callbacks:{label:c=>c.dataset.label+': '+rp(c.parsed.y)}}}}});
// forecast
const ia=D.ids.indexOf(lastA),la=F.a[ia],fe=F.f.filter(x=>x!=null),ff=fe[fe.length-1],sp=F.sp.filter(Boolean).length;
$('kf').innerHTML=kp('Harga Aktual Terakhir ('+lab(lastA)+')',rp(la))+kp('Harga Forecast Akhir ('+lab(D.ids[D.ids.length-1])+')',rp(ff))+kp('Perubahan Forecast',((ff/la-1)*100>=0?'+':'')+f2((ff/la-1)*100)+'%')+kp('Model Terpilih',F.model)+kp('MAPE Terpilih',f2(F.mape)+'%')+kp('Jumlah Lonjakan',sp);
$('tf').textContent='Harga Aktual dan Forecast '+S.k;
const labs=D.ids.map(lab),conn=F.f.map((x,i)=>i==ia?la:x),pt=F.a.map((x,i)=>F.sp[i]?x:null),cn=(a)=>a.map((x,i)=>i==ia?la:x);
mk('c2',{type:'line',data:{labels:labs,datasets:[{label:'Harga Aktual',data:F.a,borderColor:'#1f7a8c',borderWidth:2.5,pointRadius:0,tension:.25},{label:'Forecast',data:conn,borderColor:'#e8590c',borderWidth:3,pointRadius:0},{label:'Batas Bawah',data:cn(F.lo),borderColor:'#8fa398',borderDash:[5,4],borderWidth:1.5,pointRadius:0},{label:'Batas Atas',data:cn(F.hi),borderColor:'#8fa398',borderDash:[5,4],borderWidth:1.5,pointRadius:0},{label:'Lonjakan',data:pt,showLine:false,pointRadius:5,backgroundColor:'#c0392b',borderColor:'#c0392b'}]},options:{maintainAspectRatio:false,scales:{x:{ticks:{maxTicksLimit:9}},y:{ticks:{callback:v=>'Rp'+v/1000+'K'}}},plugins:{tooltip:{callbacks:{label:c=>c.dataset.label+': '+rp(c.parsed.y)}}}}});
$('tm').innerHTML='<tr><th>Model</th><th>MAPE</th><th>RMSE</th><th>Terpilih</th></tr>'+F.mp.map(r=>`<tr ${r[3]?'style="font-weight:600"':''}><td>${r[0]}</td><td>${f2(r[1])}</td><td>${Math.round(r[2]).toLocaleString('id-ID')}</td><td>${r[3]?'Ya':'Tidak'}</td></tr>`).join('');
// disparitas
mk('c3',{type:'line',data:{labels:years,datasets:D.K.map(k=>({label:k,data:years.map(y=>{const a=D.ids.map((i,x)=>[i,D.F[k].cv[x]]).filter(r=>Math.floor(r[0]/100)==y&&r[1]!=null).map(r=>r[1]);return a.length?a.reduce((p,q)=>p+q)/a.length:null}),borderColor:KC[k],borderWidth:k==S.k?3.5:1.5,tension:.3,pointRadius:2}))},options:{maintainAspectRatio:false,scales:{y:{title:{display:true,text:'Koefisien variasi'}}}}});
// insight (4 kalimat per paragraf)
const wt=ok[ok.length-1],mr=ok[0],per=S.b?BL[S.b-1]+' '+S.t:'tahun '+S.t;
const mapeBest=[...D.K].sort((a,b)=>D.F[a].mape-D.F[b].mape)[0],mapeWorst=[...D.K].sort((a,b)=>D.F[b].mape-D.F[a].mape)[0];
$('ins').innerHTML=`<p>Pada ${per}, indeks gabungan nasional berada di ${f2(avg)} dengan kategori ${KAT[cat(avg)]}. Provinsi paling terjangkau adalah ${D.P[mr[1]][0]} dengan indeks ${f2(mr[0])}. Sebaliknya, ${D.P[wt[1]][0]} menjadi yang termahal dengan indeks ${f2(wt[0])}. Sebanyak ${mahal} dari ${ok.length} provinsi tergolong relatif atau sangat mahal sehingga perlu perhatian dalam pemantauan.</p>
<p>Untuk ${S.k}, model terbaik adalah ${F.model} dengan MAPE ${f2(F.mape)}%. Harga forecast pada ${lab(D.ids[D.ids.length-1])} diproyeksikan ${rp(ff)} atau ${ff>=la?'naik':'turun'} ${f2(Math.abs((ff/la-1)*100))}% dari harga aktual terakhir. Terdapat ${sp} bulan lonjakan yang tercatat sepanjang periode pengamatan. Akurasi paling tinggi dicapai ${mapeBest} (MAPE ${f2(D.F[mapeBest].mape)}%), sedangkan ${mapeWorst} paling sulit diramal (MAPE ${f2(D.F[mapeWorst].mape)}%).</p>`}
// tabel ringkasan
const hc=v=>{const t=Math.max(-1,Math.min(1,(v-1)/.25));return t<0?`rgba(31,122,140,${-t*.5})`:`rgba(192,57,43,${t*.5})`};
$('tr').innerHTML='<tr><th>Provinsi</th>'+D.K.map(k=>`<th>${k}</th>`).join('')+'<th>Rata-rata</th></tr>'+D.R.slice().sort((a,b)=>a[7]-b[7]).map(r=>`<tr><td>${r[7]}. ${r[0]}</td>`+r.slice(1,6).map(x=>`<td style="background:${hc(x)}">${f2(x)}</td>`).join('')+`<td style="background:${hc(r[6])};font-weight:600">${f2(r[6])}</td></tr>`).join('');

const MW=1200,MH=450,PX=l=>(l-94.5)/47*MW,PY=l=>(6.6-l)/17.6*MH;
const ISL=[[[1,4,8,19,26,32,33,34],[[95.3,5.6],[97,5.2],[98.2,4.1],[99.9,2.9],[100.9,2.2],[102,1.6],[103.3,0.6],[103.8,-0.9],[104.6,-1.9],[106,-3],[105.9,-4.4],[105.7,-5.8],[104.6,-5.8],[103.4,-4.8],[102.3,-4],[101,-2.8],[100.3,-1.5],[99.3,-0.4],[98.7,0.7],[97.7,1.8],[96.5,2.6],[95.4,3.8]]],
[[3,5,6,9,10,11],[[105.2,-6.8],[106,-5.95],[107,-6],[108.3,-6.3],[109.5,-6.9],[111,-6.6],[112.5,-6.9],[113.5,-7.6],[114.4,-7.8],[114.4,-8.7],[113,-8.3],[111,-8.2],[109,-7.8],[107.5,-7.7],[106.4,-7.4],[105.5,-6.9]]],
[[2],[[114.5,-8.1],[115.7,-8.1],[115.7,-8.8],[114.8,-8.8]]],
[[22],[[115.9,-8.4],[116.7,-8.3],[116.7,-8.9],[116,-8.9]]],[[22],[[116.8,-8.4],[118.6,-8.2],[119,-8.6],[117.5,-9],[116.8,-8.9]]],
[[23],[[119.8,-8.5],[122,-8.3],[123,-8.4],[122,-8.9],[120,-8.8]]],[[23],[[118.9,-9.4],[120.3,-9.4],[120.6,-10.1],[119.2,-9.9]]],
[[23],[[123.5,-10.2],[124.2,-9.4],[125.9,-8.4],[127,-8.4],[125,-10],[124,-10.4]]],
[[12,13,14,15,16],[[109,1.4],[109.6,1.9],[111,1.2],[112.3,1.5],[114,1.4],[114.8,2.2],[115.6,3],[116.5,3.9],[117.7,4.2],[118,3.2],[117.6,2.2],[118,1],[117.4,0.3],[117.1,-0.5],[116.2,-1.6],[116.5,-2.6],[116.3,-3.8],[115.6,-3.7],[114.6,-4],[113.5,-3.4],[111.5,-3.3],[110.2,-3.1],[110.2,-2],[109.8,-0.9],[109.2,0]]],
[[7,27,28,29,30,31],[[120,0.9],[121.5,1],[123.2,0.9],[124.5,1.6],[125.1,1.7],[124.7,1],[123.6,0.4],[122.2,0.5],[121.2,0.3],[121.9,-0.5],[123.3,-0.8],[123.4,-1.3],[122,-1.1],[121.4,-1.9],[122.3,-2.7],[122,-3.4],[122.8,-4.3],[123,-5],[122.4,-5.4],[121.6,-4.5],[121.1,-3.8],[120.9,-2.8],[120.4,-3],[120.5,-4.3],[120.4,-5.6],[119.5,-5.5],[119.4,-4],[118.9,-3],[119.3,-1.8],[119.8,-0.8]]],
[[24,25],[[130.9,-0.9],[132.5,-0.4],[134,-0.8],[134.2,-1.6],[133.7,-2.7],[134.4,-3.2],[135.2,-3.4],[136.6,-2.3],[138,-1.7],[139.5,-2.4],[141,-2.6],[141,-9.1],[139.9,-8.1],[138.5,-8.3],[137.8,-7.6],[138,-6.4],[136.8,-5],[135,-4.4],[133.6,-4],[132.8,-4.2],[132.6,-3.4],[131.9,-2.9],[131.3,-1.8]]],
[[21],[[127.8,2.2],[128.7,1.6],[128.4,0.3],[128.2,-0.6],[127.6,-0.4],[127.9,0.7],[127.4,1.2]]],
[[20],[[128,-3],[130.8,-3],[130.8,-3.5],[128,-3.4]]],[[20],[[126.6,-3.2],[127.3,-3.2],[127.3,-3.8],[126.6,-3.8]]],[[20],[[134,-6],[134.6,-6.2],[134.5,-7],[134,-6.8]]],[[20],[[131,-7],[132,-7.2],[131.8,-8.2],[131,-8]]],
[[17],[[105.1,-1.6],[106.8,-2],[106.6,-3.1],[105.3,-2.6]]],[[17],[[107.5,-2.5],[108.3,-2.5],[108.3,-3.3],[107.5,-3.3]]],
[[18],[[103.5,1.2],[104.5,1.2],[104.5,0.7],[103.5,0.7]]],[[18],[[107.8,4.1],[108.4,4.1],[108.4,3.5],[107.8,3.5]]]];
const CT={7:[122.4,.6,1],29:[120.9,-1,1.3],30:[122.3,-4,1],28:[120,-4,1],27:[119.2,-2.4,.8],25:[132.7,-1.8,1],24:[139,-4.5,1.4],6:[106.8,-6.2,.35],5:[110.4,-7.9,.45],3:[106.2,-6.5,.9],15:[116.6,0,1.2],16:[116.8,3.4,.8],19:[105.3,-5,1]};
let MAPI=null,CV=[];
function buildMap(){const cv=$('map');cv.width=MW;cv.height=MH;const ctx=cv.getContext('2d',{willReadFrequently:true});MAPI=new Int16Array(MW*MH).fill(-1);ctx.fillStyle=ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.lineJoin='round';
ISL.forEach(([ps,poly])=>{ctx.clearRect(0,0,MW,MH);ctx.beginPath();poly.forEach((q,i)=>i?ctx.lineTo(PX(q[0]),PY(q[1])):ctx.moveTo(PX(q[0]),PY(q[1])));ctx.closePath();ctx.fill();ctx.stroke();const im=ctx.getImageData(0,0,MW,MH).data;
const cs=ps.map(id=>{const j=id-1,c=CT[id]||[D.P[j][2],D.P[j][1],1];return[j,PX(c[0]),PY(c[1]),c[2]]});
for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(im[(y*MW+x)*4+3]<100)continue;let b=-1,bd=1e9;for(const c of cs){const d=Math.hypot(x-c[1],y-c[2])/c[3];if(d<bd){bd=d;b=c[0]}}MAPI[y*MW+x]=b}});
const mv=e=>{const r=cv.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*MW),y=Math.floor((e.clientY-r.top)/r.height*MH),j=GEOF?hitGeo(x,y):MAPI[y*MW+x];if(j!==cv._h){cv._h=j;paintMap(CV,j);$('tip').innerHTML=j>=0?(CV[j]==null?`<b>${D.P[j][0]}</b>: tidak ada data pada periode ini`:`<b>${D.P[j][0]}</b>: indeks ${f2(CV[j])}, ${KAT[cat(CV[j])]}`):'Arahkan kursor atau ketuk provinsi untuk melihat detail.'}};
cv.onmousemove=cv.onclick=e=>{mv(e);ftip(e)};cv.onmouseleave=()=>{cv._h=-1;paintMap(CV,-1);ftip(null)}}
function paintMap(v,h){if(GEOF){drawGeo(v,h);return}const cv=$('map'),ctx=cv.getContext('2d'),img=ctx.createImageData(MW,MH),d=img.data,rgb=COL.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
for(let i=0;i<MW*MH;i++){const o=MAPI[i];if(o<0)continue;let c=v[o]==null?[170,170,170]:rgb[cat(v[o])];if(o===h)c=c.map(q=>Math.min(255,q+45));const e=(MAPI[i+1]!==o&&MAPI[i+1]>=0)||(MAPI[i+MW]!==o&&MAPI[i+MW]>=0);if(e)c=[255,255,255];d[i*4]=c[0];d[i*4+1]=c[1];d[i*4+2]=c[2];d[i*4+3]=255}
ctx.putImageData(img,0,0)}

// ===== Peta GeoJSON asli (otomatis dipakai jika indonesia.geojson berisi polygon provinsi) =====
let GEOF=null;
const GAL={JAKARTARAYA:'JAKARTA',RIAUISLANDS:'KEPRI',IRIANJAYABARAT:'PAPUABARAT',IRIANJAYA:'PAPUA',PAPUASELATAN:'PAPUA',PAPUATENGAH:'PAPUA',PAPUAPEGUNUNGAN:'PAPUA',PAPUABARATDAYA:'PAPUABARAT',BANGKABELITUNGISLANDS:'BANGKABELITUNG'};
function normN(s){s=String(s||'').toUpperCase().replace(/[.\-_]/g,' ');if(/\bKEP(ULAUAN)?\s*RIAU\b/.test(s))return'KEPRI';s=s.replace(/\b(PROVINSI|PROPINSI|DAERAH ISTIMEWA|DAERAH KHUSUS IBUKOTA|DKI|DI|KEPULAUAN|KEP)\b/g,'').replace(/[^A-Z]/g,'');return GAL[s]||s}
function ftip(e){let t=$('ftip');if(!t){t=document.createElement('div');t.id='ftip';t.style.cssText='position:fixed;z-index:9;pointer-events:none;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:12.5px;line-height:1.45;box-shadow:0 4px 14px rgba(0,0,0,.18);display:none;max-width:250px';document.body.appendChild(t)}
const j=$('map')._h;if(!e||j==null||j<0){t.style.display='none';return}
const r=D.R.find(x=>x[0]==D.P[j][0]),v=CV[j];
t.innerHTML=`<b>${D.P[j][0]}</b><br>Indeks gabungan periode ini: ${v==null?'-':f2(v)+' ('+KAT[cat(v)]+')'}`+(r?`<div style="border-top:1px solid var(--line);margin:6px 0 4px;padding-top:4px;color:var(--mut)">Rata-rata indeks 2020-2026</div>`+D.K.map((k,i)=>`${k}: <b>${f2(r[i+1])}</b>`).join('<br>')+`<br>Peringkat keterjangkauan: <b>${r[7]}</b> dari 34`:'');
t.style.display='block';t.style.left=Math.max(4,Math.min(e.clientX+14,innerWidth-260))+'px';t.style.top=Math.min(e.clientY+14,innerHeight-190)+'px'}
function hitGeo(x,y){const ctx=$('map').getContext('2d');for(const f of GEOF){if(ctx.isPointInPath(f.p,x,y,'evenodd'))return f.j}return -1}
function drawGeo(v,h){const ctx=$('map').getContext('2d');ctx.clearRect(0,0,MW,MH);ctx.lineJoin='round';ctx.lineWidth=.8;ctx.strokeStyle='#fff';
GEOF.forEach(f=>{ctx.fillStyle=f.j<0||v[f.j]==null?'#bfc5c1':COL[cat(v[f.j])];ctx.fill(f.p,'evenodd');if(f.j>=0&&f.j===h){ctx.fillStyle='rgba(255,255,255,.3)';ctx.fill(f.p,'evenodd')}ctx.stroke(f.p)})}
function loadGeo(){const use=g=>{if(!g||!g.features||g.features.length<10)return;const want=new Map(D.P.map((p,j)=>[normN(p[0]),j]));let bk=null,bc=0;Object.keys(g.features[0].properties||{}).forEach(k=>{const c=g.features.filter(f=>want.has(normN(f.properties[k]))).length;if(c>bc){bc=c;bk=k}});if(!bk||bc<10){console.warn('GeoJSON: nama provinsi tidak cocok dengan data');return}
GEOF=g.features.filter(f=>f.geometry).map(f=>{const n=normN(f.properties[bk]),p=new Path2D(),gm=f.geometry;(gm.type=='Polygon'?[gm.coordinates]:gm.coordinates).forEach(poly=>poly.forEach(r=>{r.forEach((q,i)=>i?p.lineTo(PX(q[0]),PY(q[1])):p.moveTo(PX(q[0]),PY(q[1])));p.closePath()}));return{p,j:want.has(n)?want.get(n):-1}});paintMap(CV,-1)};
fetch('indonesia.geojson').then(r=>r.json()).then(use).catch(()=>{})}
buildMap();fillB();draw();loadGeo();
