/* Data, penyimpanan di browser, dan tautan berbagi */
const RR={KEY:"rancang-rumah-v1",S:null};
RR.uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
RR.all=()=>{try{const a=JSON.parse(localStorage.getItem(RR.KEY));return Array.isArray(a)?a:[]}catch(e){return[]}};
RR.put=a=>{try{localStorage.setItem(RR.KEY,JSON.stringify(a));return true}catch(e){return false}};
RR.get=id=>RR.all().find(p=>p.id===id)||null;
RR.save=p=>{const a=RR.all(),i=a.findIndex(x=>x.id===p.id);p.upd=Date.now();i<0?a.push(p):a[i]=p;return RR.put(a)};
RR.del=id=>RR.put(RR.all().filter(p=>p.id!==id));
RR.valid=o=>!!(o&&o.lot&&Array.isArray(o.rooms)&&o.rooms.every(r=>r&&["x","z","w","d"].every(k=>r[k]!==null&&r[k]!==""&&isFinite(+r[k]))));
const clamp=(v,a,b,d)=>isFinite(+v)?Math.min(b,Math.max(a,+v)):d;
const hex=(c,d)=>/^#[0-9a-f]{6}$/i.test(c)?c:d;
RR.norm=o=>{
 if(!RR.valid(o))throw new Error("tidak valid");
 const rs=o.rooms.map((r,i)=>({id:i+1,name:String(r.name||"Ruangan").slice(0,40),x:+r.x,z:+r.z,w:Math.max(.5,+r.w),d:Math.max(.5,+r.d),
  floor:hex(r.floor,"#dddddd"),door:/^[NSEW]$/.test(r.door)?r.door:"-",win:/^[NSEW]$/.test(r.win)?r.win:"-",f:r.f===1?1:0}));
 const si=o.rooms.findIndex(r=>r.id===o.sel);
 const its=(Array.isArray(o.items)?o.items:[]).filter(i=>i&&RR.CAT[i.t]&&isFinite(+i.x)&&isFinite(+i.z)).map((i,k)=>({id:k+1,t:i.t,x:+i.x,z:+i.z,f:i.f===1?1:0,r:((+i.r||0)%4+4)%4,c:hex(i.c,RR.CAT[i.t].c)}));
 return{id:RR.uid(),name:String(o.name||o.n||"Desain saya").slice(0,60),lot:{w:clamp(o.lot.w,3,200,10),d:clamp(o.lot.d,3,200,15)},
  h:clamp(o.h,2.4,6,3),wall:hex(o.wall,"#f4f1ea"),next:rs.length+1,sel:rs.length?rs[Math.max(0,si)].id:null,rooms:rs,items:its,ni:its.length+1,upd:Date.now()}};
RR.demo=()=>[
 ["Ruang Tamu",1,2,4,4,"#d9c6a5","N","W"],["Ruang Tengah",5,2,4,4,"#cfd8c3","-","E"],
 ["Kamar 1",1,6,4,3.5,"#c9d3e0","E","W"],["Kamar 2",5,6,4,3.5,"#e0d0c9","W","E"],
 ["Dapur",1,9.5,4,2.5,"#e3dcc2","E","S"],["Kamar mandi",5,9.5,4,2.5,"#bfd9d6","W","S"]
].map(([name,x,z,w,d,floor,door,win])=>({name,x,z,w,d,floor,door,win}));
RR.make=(name,w,d,contoh)=>{
 const sx=w/10,sz=d/15,r1=v=>Math.round(v*10)/10;
 const rooms=contoh?RR.demo().map(r=>({...r,x:r1(r.x*sx),z:r1(r.z*sz),w:r1(r.w*sx),d:r1(r.d*sz)})):[];
 return RR.norm({name,lot:{w,d},rooms});
};
const b64=s=>btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
RR.enc=p=>{let s="";new TextEncoder().encode(JSON.stringify({n:p.name,lot:p.lot,h:p.h,wall:p.wall,rooms:p.rooms,items:p.items})).forEach(c=>s+=String.fromCharCode(c));return b64(s)};
RR.dec=t=>{t=t.replace(/-/g,"+").replace(/_/g,"/");while(t.length%4)t+="=";return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(t),c=>c.charCodeAt(0))))};
RR.CAT={sofa:{n:"Sofa",w:2,d:.9,c:"#7a8fa6"},meja:{n:"Meja makan",w:1.6,d:.9,c:"#a8794f"},kursi:{n:"Kursi",w:.45,d:.45,c:"#a8794f"},tv:{n:"TV",w:1.2,d:.4,c:"#4a4a4a"},vas:{n:"Vas bunga",w:.25,d:.25,c:"#c4623e"},kasur:{n:"Kasur",w:1.6,d:2,c:"#9db4c8"},lemari:{n:"Lemari",w:1.2,d:.55,c:"#b89a76"},tangga:{n:"Tangga",w:.9,d:3,c:"#c9c2b4"}};
