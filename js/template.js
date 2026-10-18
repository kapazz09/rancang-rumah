/* Pembuat denah awal dari jawaban pertanyaan */
RR.gen=o=>{
 const k={hemat:.85,standar:1,luas:1.2}[o.uk]||1,r1=v=>Math.round(v*10)/10,two=o.fl===2,W=o.w-2;
 const A=(name,w,d,color,x)=>({name,w:w*k,d:d*k,color,...x});
 const kamar=n=>Array.from({length:n},(_,i)=>i?A("Kamar "+(i+1),3,3,"#c9d3e0"):A("Kamar utama",3.5,3.5,"#e0d0c9"));
 const km=n=>Array.from({length:n},(_,i)=>A("Kamar mandi"+(i?" "+(i+1):""),1.8,2.2,"#bfd9d6"));
 const stair=x=>({name:"Tangga",w:1.2,d:3.2,color:"#c9c2b4",fix:1,...x});
 const L0=[],L1=[];
 if(two)L0.push(stair()),L1.push(stair({skip:1}));
 if(o.tamu)L0.push(A("Ruang tamu",3.5,3.5,"#d9c6a5"));
 if(o.kel)L0.push(A("Ruang keluarga",3.5,4,"#cfd8c3"));
 if(o.makan&&o.dapur&&o.kd==="terbuka")L0.push(A("Ruang makan + dapur",4,3.5,"#e3dcc2"));
 else{if(o.makan)L0.push(A("Ruang makan",3,3,"#e3dcc2"));if(o.dapur)L0.push(A("Dapur",3,2.5,"#e3dcc2"))}
 if(o.kerja)L0.push(A("Ruang kerja",2.5,3,"#d8d3e0"));
 if(o.musala)L0.push(A("Musala",2,2,"#dddddd"));
 if(o.gudang)L0.push(A("Gudang",1.5,2,"#dddddd"));
 if(o.cuci)L0.push(A("Cuci dan jemur",2,2,"#dddddd"));
 if(two){L0.push(...km(1));if(o.balkon)L1.push(A("Balkon",3,1.8,"#dddddd"));L1.push(...kamar(o.kamar),...km(Math.max(0,o.km-1)))}
 else L0.push(...kamar(o.kamar),...km(o.km));
 const cw=o.cp?Math.max(3,2.7*o.cp):0,fd=Math.max(o.cp?5.5:0,o.teras?2.5:0),zs=1+fd;
 function pack(L){const rows=[];let row=[],sw=0;
  L.forEach(r=>{if(row.length&&sw+r.w>W+.01){rows.push(row);row=[];sw=0}row.push(r);sw+=r.w});
  if(row.length)rows.push(row);
  let z=0;const out=[];
  rows.forEach((row,ri)=>{const fx=row.filter(r=>r.fix).reduce((a,r)=>a+r.w,0),fw=row.filter(r=>!r.fix).reduce((a,r)=>a+r.w,0),
   dep=Math.max(...row.map(r=>r.d)),sc=fw?Math.min(1.6,(W-fx)/fw):1;let x=0;
   row.forEach((r,ci)=>{const w=r.fix?r.w:r.w*sc;out.push({...r,x,z,w,d:dep,ri,last:ri===rows.length-1,left:ci===0,right:ci===row.length-1});x+=w});z+=dep});
  return{out,D:z}}
 const P0=pack(L0),P1=pack(L1),fit=(o.d-1-zs)/Math.max(P0.D,P1.D);
 if(fit<.85&&o.uk!=="hemat")return RR.gen({...o,uk:"hemat"});
 const s=Math.max(.6,Math.min(1,fit));
 const rooms=[],items=[];
 if(o.cp)rooms.push({name:"Carport",x:1,z:1,w:cw,d:5.5,floor:"#b9b9b4",door:"-",win:"-",f:0});
 if(o.teras)rooms.push({name:"Teras",x:1+cw,z:1,w:r1(Math.max(2,W-cw)),d:2.5,floor:"#d9cdb8",door:"-",win:"-",f:0});
 [[P0,0],[P1,1]].forEach(([p,f])=>p.out.forEach(r=>{
  if(r.skip)return;
  const x1=r1(1+r.x),z1=r1(zs+r.z*s),m={name:r.name,x:x1,z:z1,w:r1(1+r.x+r.w)-x1,d:r1(zs+(r.z+r.d)*s)-z1,floor:r.color,f,
   door:r.ri===0?(/tamu/.test(r.name)?"N":"S"):"N",win:r.left?"W":r.right?"E":r.last?"S":"-"};
  rooms.push(m);
  const cx=r1(m.x+m.w/2),cz=r1(m.z+m.d/2),add=(t,x,z,rot)=>items.push({t,x:r1(x),z:r1(z),f,r:rot||0});
  if(!o.furn)return;
  if(r.name==="Tangga")add("tangga",cx,cz);
  else if(/tamu/.test(r.name)){add("sofa",cx,cz);add("vas",m.x+.4,m.z+.4)}
  else if(/keluarga/.test(r.name)){add("sofa",cx,cz);add("tv",cx,m.z+.4)}
  else if(/makan/.test(r.name)){add("meja",cx,cz);add("kursi",cx-.5,cz-.7);add("kursi",cx+.5,cz-.7)}
  else if(/^Kamar [^m]|^Kamar utama/.test(r.name)){add("kasur",cx,cz);if(m.w>2.8)add("lemari",m.x+.7,m.z+m.d-.35)}
  else if(/kerja/.test(r.name))add("meja",cx,cz)}));
 return RR.norm({name:o.name,lot:{w:o.w,d:o.d},h:3,rooms,items})};
