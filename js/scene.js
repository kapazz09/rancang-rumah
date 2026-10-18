/* Tampilan 3D, perabot, kamera, dan seret-pindah */
(function(){
const cv=document.getElementById("cv"),rd=new THREE.WebGLRenderer({canvas:cv,antialias:true});
rd.setPixelRatio(Math.min(devicePixelRatio,2));
const sc=new THREE.Scene();sc.background=new THREE.Color("#dfe6e4");
sc.add(new THREE.HemisphereLight(0xffffff,0x8a9a88,.95));
const dl=new THREE.DirectionalLight(0xffffff,.55);dl.position.set(8,14,6);sc.add(dl);
const cam=new THREE.PerspectiveCamera(50,1,.05,400);
let grp=new THREE.Group();sc.add(grp);
let inside=false,drag=null;
RR.labels=true;RR.upper=false;RR.ghost=false;RR.fl=0;RR.onPick=null;RR.onMove=null;
RR.cur=()=>RR.S.rooms.find(r=>r.id===RR.S.sel)||null;
RR.curItem=()=>(RR.S.items||[]).find(i=>i.id===RR.S.isel)||null;
const base=f=>f*(RR.S.h+.1);
const mat=(c,s,op)=>new THREE.MeshLambertMaterial({color:c,emissive:s?"#ff8a1f":"#000000",emissiveIntensity:s?.35:0,transparent:op<1,opacity:op||1});
const box=(g,w,h,d,x,y,z,c,s)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,s));m.position.set(x,y,z);g.add(m)};
const L4=[[-1,-1],[1,-1],[-1,1],[1,1]];
const B={
 sofa:(g,w,d,c,s)=>{box(g,w,.4,d,0,.2,0,c,s);box(g,w,.5,.2,0,.65,-d/2+.1,c,s);box(g,.2,.3,d-.2,-w/2+.1,.55,.1,c,s);box(g,.2,.3,d-.2,w/2-.1,.55,.1,c,s)},
 meja:(g,w,d,c,s)=>{box(g,w,.06,d,0,.72,0,c,s);L4.forEach(([a,b])=>box(g,.07,.7,.07,a*(w/2-.08),.35,b*(d/2-.08),c,s))},
 kursi:(g,w,d,c,s)=>{box(g,w,.06,d,0,.45,0,c,s);box(g,w,.45,.05,0,.7,-d/2+.03,c,s);L4.forEach(([a,b])=>box(g,.04,.43,.04,a*(w/2-.04),.22,b*(d/2-.04),c,s))},
 tv:(g,w,d,c,s)=>{box(g,w,.45,d,0,.22,0,c,s);box(g,w*.9,.6,.04,0,.78,0,"#111111",s)},
 vas:(g,w,d,c,s)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(w*.4,w*.25,.35,16),mat(c,s));m.position.y=.18;g.add(m)},
 kasur:(g,w,d,c,s)=>{box(g,w,.35,d,0,.18,0,"#8a6d4f",s);box(g,w-.1,.15,d-.1,0,.42,0,c,s);box(g,.6,.12,.35,-w/4,.55,-d/2+.3,"#ffffff",s);box(g,.6,.12,.35,w/4,.55,-d/2+.3,"#ffffff",s)},
 lemari:(g,w,d,c,s)=>box(g,w,2,d,0,1,0,c,s),
 tangga:(g,w,d,c,s)=>{const n=14,H=RR.S.h+.1;for(let k=0;k<n;k++)box(g,w,H*(k+1)/n,d/n,0,H*(k+1)/n/2,-d/2+d/n*(k+.5),c,s)}
};
function label(a,b){
 const c=document.createElement("canvas");c.width=512;c.height=128;const g=c.getContext("2d");
 g.fillStyle="rgba(255,255,255,.88)";g.fillRect(0,0,512,128);g.fillStyle="#1d2a2f";g.textAlign="center";
 g.font="bold 44px system-ui,sans-serif";g.fillText(a.slice(0,18),256,54,490);
 g.font="36px system-ui,sans-serif";g.fillText(b,256,104);
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));
 sp.scale.set(2.4,.6,1);sp.renderOrder=5;return sp}

RR.build=function(){
 const S=RR.S;
 sc.remove(grp);
 grp.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});
 grp=new THREE.Group();sc.add(grp);
 const LW=S.lot.w,LD=S.lot.d,H=S.h,t=.15,vis=o=>o.f===0||RR.upper,two=S.rooms.some(r=>r.f===1);
 const lot=new THREE.Mesh(new THREE.BoxGeometry(LW,.1,LD),new THREE.MeshLambertMaterial({color:"#bcd4ae"}));
 lot.position.set(LW/2,-.1,LD/2);grp.add(lot);
 const edge=new THREE.LineSegments(new THREE.EdgesGeometry(lot.geometry),new THREE.LineBasicMaterial({color:"#4b6b45"}));
 edge.position.copy(lot.position);grp.add(edge);
 const wallM=new THREE.MeshLambertMaterial({color:S.wall});
 const wall2=new THREE.MeshLambertMaterial({color:new THREE.Color(S.wall).lerp(new THREE.Color("#8fb0d8"),.25)});
 const wallG=new THREE.MeshLambertMaterial({color:S.wall,transparent:true,opacity:.12,depthWrite:false});
 S.rooms.filter(vis).forEach(r=>{
  const sel=r.id===S.sel&&!S.isel,cx=r.x+r.w/2,cz=r.z+r.d/2,b=base(r.f);
  const op=/^(teras|carport|balkon)/i.test(r.name),rail=/^balkon/i.test(r.name),gh=RR.ghost&&r.f===0,wm=gh?wallG:r.f?wall2:wallM,wh=rail?.9:H;
  const f=new THREE.Mesh(new THREE.BoxGeometry(r.w,.1,r.d),mat(r.floor,sel,gh?.3:1));
  f.position.set(cx,b,cz);if(!gh)f.userData.id=r.id;grp.add(f);
  (op&&!rail?[]:[["N",cx,r.z,r.w+t,t],["S",cx,r.z+r.d,r.w+t,t],["W",r.x,cz,t,r.d+t],["E",r.x+r.w,cz,t,r.d+t]]).forEach(([s,x,z,sx,sz])=>{
   const m=new THREE.Mesh(new THREE.BoxGeometry(sx,wh,sz),wm);
   m.position.set(x,b+wh/2+.05,z);if(!gh)m.userData.id=r.id;grp.add(m);
   const hz=s==="N"||s==="S",len=hz?r.w:r.d;
   [["door",r.door,.9,2.1,1.1,"#8a5a34",1,-1],["win",r.win,1.2,1,1.55,"#7fbbe6",.7,1]].forEach(([k,sd,ow,oh,oy,c,op,sg])=>{
    if(sd!==s||len<ow+.5||op||gh)return;
    const off=r.door===r.win&&len>=2*ow+.6?sg*len/4:0;
    const o=new THREE.Mesh(new THREE.BoxGeometry(hz?ow:t+.04,oh,hz?t+.04:ow),mat(c,false,op));
    o.position.set(hz?x+off:x,b+oy,hz?z:z+off);o.userData.id=r.id;grp.add(o)});
  });
  if(op&&!rail)[[r.x,r.z],[r.x+r.w,r.z],[r.x,r.z+r.d],[r.x+r.w,r.z+r.d]].forEach(([x,z])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.15,H,.15),wm);m.position.set(x,b+H/2+.05,z);if(!gh)m.userData.id=r.id;grp.add(m)});
  if(RR.labels&&!gh){const sp=label((two?"L"+(r.f+1)+" ":"")+r.name,r.w.toFixed(1)+" × "+r.d.toFixed(1)+" m");sp.position.set(cx,b+.5,cz);grp.add(sp)}
 });
 (S.items||[]).filter(vis).filter(i=>!(RR.ghost&&i.f===0)).forEach(i=>{
  const k=RR.CAT[i.t],g=new THREE.Group();B[i.t](g,k.w,k.d,i.c,i.id===S.isel);
  g.position.set(i.x,base(i.f)+.05,i.z);g.rotation.y=i.r*Math.PI/2;
  g.traverse(o=>{o.userData.iid=i.id});grp.add(g)})};

const O={T:new THREE.Vector3(5,0,7.5),th:.6,ph:1,dist:20};
function apply(){
 O.ph=Math.min(3.09,Math.max(.01,O.ph));O.dist=Math.max(inside?.2:2,Math.min(120,O.dist));
 cam.position.set(O.T.x+O.dist*Math.sin(O.ph)*Math.sin(O.th),O.T.y+O.dist*Math.cos(O.ph),O.T.z+O.dist*Math.sin(O.ph)*Math.cos(O.th));
 cam.lookAt(O.T)}
RR.view=function(k){
 const S=RR.S,r=RR.cur();inside=k==="i"&&!!r;
 if(inside){O.T.set(r.x+r.w/2,base(r.f)+1.5,r.z+r.d/2);O.dist=.4;O.ph=Math.PI/2;O.th=0}
 else{O.T.set(S.lot.w/2,0,S.lot.d/2);O.dist=Math.max(S.lot.w,S.lot.d)*1.4;if(k==="t"){O.ph=.01;O.th=0}else{O.ph=1;O.th=.6}}
 apply()};
RR.shot=cb=>{rd.render(sc,cam);cv.toBlob(cb,"image/png")};

const ray=new THREE.Raycaster(),ptrs=new Map();let moved=0,pinch=0;
function hit(e){const b=cv.getBoundingClientRect();
 ray.setFromCamera({x:(e.clientX-b.left)/b.width*2-1,y:-((e.clientY-b.top)/b.height*2-1)},cam);
 const h=ray.intersectObjects(grp.children,true).find(x=>x.object.userData.id||x.object.userData.iid);return h?h.object.userData:null}
function ground(y){const p=new THREE.Vector3();return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-y),p)?p:null}
cv.addEventListener("pointerdown",e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(ptrs.size===1){moved=0;const S=RR.S,u=hit(e);
  if(u){const it=u.iid&&u.iid===S.isel?RR.curItem():(!u.iid&&u.id===S.sel&&!S.isel?RR.cur():null);
   if(it){const p=ground(base(it.f)+.05);if(p)drag={o:it,dx:p.x-(it.w?it.x:it.x),dz:p.z-it.z}}}}
 if(ptrs.size===2){drag=null;const[a,b]=[...ptrs.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y)}
 cv.style.cursor="grabbing"});
cv.addEventListener("pointermove",e=>{
 const p=ptrs.get(e.pointerId);if(!p)return;
 const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);
 if(drag){hit(e);const g=ground(base(drag.o.f)+.05);if(g){const n=v=>Math.round(v*10)/10;drag.o.x=n(g.x-drag.dx);drag.o.z=n(g.z-drag.dz);RR.build();if(RR.onMove)RR.onMove()}return}
 if(ptrs.size===2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch)O.dist*=pinch/d;pinch=d;apply();return}
 if(e.shiftKey||e.buttons===2){const k=O.dist*.0016;
  O.T.x-=dx*k*Math.cos(O.th)+dy*k*Math.sin(O.th);O.T.z+=dx*k*Math.sin(O.th)-dy*k*Math.cos(O.th)}
 else{O.th-=dx*.006;O.ph-=dy*.006}
 apply()});
function up(e){const one=ptrs.size===1;ptrs.delete(e.pointerId);cv.style.cursor="grab";if(ptrs.size<2)pinch=0;drag=null;
 if(e.type==="pointerup"&&one&&moved<6){const u=hit(e);if(u&&RR.onPick)RR.onPick(u.iid?"i":"r",u.iid||u.id)}}
cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
cv.addEventListener("contextmenu",e=>e.preventDefault());
cv.addEventListener("wheel",e=>{e.preventDefault();O.dist*=e.deltaY>0?1.1:.9;apply()},{passive:false});
function size(){const b=document.getElementById("stage").getBoundingClientRect();rd.setSize(b.width,b.height,false);cam.aspect=b.width/b.height;cam.updateProjectionMatrix()}
new ResizeObserver(size).observe(document.getElementById("stage"));
size();
(function loop(){rd.render(sc,cam);requestAnimationFrame(loop)})();
})();
