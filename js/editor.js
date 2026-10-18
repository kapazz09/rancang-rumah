/* Panel editor: ruangan, perabot, lantai, simpan, tautan */
(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const q=new URLSearchParams(location.search);
let P=q.get("id")?RR.get(q.get("id")):null,dirty=false;
if(!P&&location.hash.startsWith("#d=")){
 try{P=RR.norm(RR.dec(location.hash.slice(3)));P.name+=" (dari tautan)";dirty=true;history.replaceState(null,"",location.pathname)}
 catch(e){alert("Tautan tidak valid atau terpotong.")}}
if(!P){location.replace("index.html");return}
RR.S=P;P.items=P.items||[];P.ni=P.ni||P.items.length+1;
RR.upper=P.rooms.concat(P.items).some(o=>o.f===1);RR.fl=RR.upper?1:0;
const cur=RR.cur,curI=RR.curItem,status=m=>{$("#status").textContent=m},touch=()=>{dirty=true};
const fn=f=>f?"L2 ":"";

function chips(){
 $("#chips").innerHTML=P.rooms.map(r=>'<button data-id="'+r.id+'" class="'+(r.id===P.sel&&!P.isel?"on":"")+'">'+fn(r.f)+esc(r.name)+"</button>").join("");
 $("#chips").querySelectorAll("button").forEach(b=>b.onclick=()=>pick("r",+b.dataset.id));
 $("#ichips").innerHTML=P.items.map(i=>'<button data-id="'+i.id+'" class="'+(i.id===P.isel?"on":"")+'">'+fn(i.f)+RR.CAT[i.t].n+"</button>").join("");
 $("#ichips").querySelectorAll("button").forEach(b=>b.onclick=()=>pick("i",+b.dataset.id))}
function pick(k,id){if(k==="i")P.isel=id;else{P.sel=id;P.isel=null}RR.build();chips();fill()}
RR.onPick=pick;
function fill(){
 const r=cur(),i=curI();$("#ed").style.display=r&&!i?"":"none";$("#ei").style.display=i?"":"none";
 if(r){$("#en").value=r.name;$("#ex").value=r.x;$("#ez").value=r.z;$("#ew").value=r.w;$("#edp").value=r.d;
  $("#efl").value=r.floor;$("#edr").value=r.door;$("#ewn").value=r.win;$("#erf").value=r.f}
 if(i){$("#ix").value=i.x;$("#iz").value=i.z;$("#if").value=i.f;$("#ic").value=i.c}}
RR.onMove=()=>{touch();const r=cur(),i=curI();if(i){$("#ix").value=i.x;$("#iz").value=i.z}else if(r){$("#ex").value=r.x;$("#ez").value=r.z}info()};
function info(){
 let a=0;const m=[],R=P.rooms,L=P.lot;
 R.forEach((r,i)=>{a+=r.w*r.d;
  if(r.x<0||r.z<0||r.x+r.w>L.w+.001||r.z+r.d>L.d+.001)m.push(r.name+" keluar dari batas lahan");
  for(let j=i+1;j<R.length;j++){const o=R[j];
   if(r.f===o.f&&r.x<o.x+o.w-.01&&o.x<r.x+r.w-.01&&r.z<o.z+o.d-.01&&o.z<r.z+r.d-.01)m.push(r.name+" tumpang tindih dengan "+o.name)}});
 $("#info").innerHTML="Jumlah luas ruangan: <b>"+a.toFixed(1)+" m²</b>. Luas lahan: "+(L.w*L.d).toFixed(1)+" m²."+m.map(x=>'<div class="warn">'+esc(x)+"</div>").join("")}
const num=(id,d,min)=>{const v=parseFloat($(id).value);return isNaN(v)?d:Math.max(min,v)};
const upd=()=>{touch();RR.build();info()};

$("#pn").value=P.name;$("#pn").oninput=()=>{P.name=$("#pn").value.slice(0,60);touch()};
$("#lw").value=P.lot.w;$("#ld").value=P.lot.d;$("#lh").value=P.h;$("#lc").value=P.wall;
$("#lw").oninput=()=>{P.lot.w=num("#lw",P.lot.w,3);upd()};
$("#ld").oninput=()=>{P.lot.d=num("#ld",P.lot.d,3);upd()};
$("#lh").oninput=()=>{P.h=Math.min(6,num("#lh",P.h,2.4));upd()};
$("#lc").oninput=()=>{P.wall=$("#lc").value;upd()};
function edit(){const r=cur();if(!r)return;
 r.name=$("#en").value;r.x=num("#ex",r.x,-50);r.z=num("#ez",r.z,-50);r.w=num("#ew",r.w,.5);r.d=num("#edp",r.d,.5);
 r.floor=$("#efl").value;r.door=$("#edr").value;r.win=$("#ewn").value;r.f=+$("#erf").value;upd();chips()}
["#en","#ex","#ez","#ew","#edp","#efl"].forEach(i=>$(i).oninput=edit);
["#edr","#ewn","#erf"].forEach(i=>$(i).onchange=edit);
function editI(){const i=curI();if(!i)return;i.x=num("#ix",i.x,-50);i.z=num("#iz",i.z,-50);i.f=+$("#if").value;i.c=$("#ic").value;upd();chips()}
["#ix","#iz","#ic"].forEach(i=>$(i).oninput=editI);$("#if").onchange=editI;
$("#add").onclick=()=>{const id=P.next++;P.rooms.push({id,name:"Ruangan "+id,x:0,z:0,w:3,d:3,floor:"#dddddd",door:"-",win:"-",f:RR.fl});pick("r",id);info();touch()};
$("#del").onclick=()=>{const r=cur();if(!r||!confirm("Hapus "+r.name+"?"))return;
 P.rooms=P.rooms.filter(x=>x.id!==r.id);P.sel=P.rooms.length?P.rooms[0].id:null;RR.build();chips();fill();info();touch()};
$("#ai").innerHTML=Object.entries(RR.CAT).map(([k,v])=>'<option value="'+k+'">'+v.n+"</option>").join("");
$("#addi").onclick=()=>{const t=$("#ai").value,r=cur(),id=P.ni++;
 P.items.push({id,t,x:r?Math.round((r.x+r.w/2)*10)/10:P.lot.w/2,z:r?Math.round((r.z+r.d/2)*10)/10:P.lot.d/2,f:r?r.f:RR.fl,r:0,c:RR.CAT[t].c});pick("i",id);touch()};
$("#irot").onclick=()=>{const i=curI();if(i){i.r=(i.r+1)%4;upd()}};
$("#idel").onclick=()=>{const i=curI();if(!i)return;P.items=P.items.filter(x=>x.id!==i.id);P.isel=null;RR.build();chips();fill();touch()};
$("#vp").onclick=()=>RR.view("p");$("#vt").onclick=()=>RR.view("t");$("#vi").onclick=()=>RR.view("i");
function mark(id){["f1","f2","f3"].forEach(k=>$("#"+k).classList.toggle("on",k===id))}
function setF(id,up,gh,fl,msg){RR.upper=up;RR.ghost=gh;if(fl!==null)RR.fl=fl;RR.build();mark(id);status(msg)}
$("#f1").onclick=()=>setF("f1",false,false,0,"Hanya lantai 1. Ruangan dan perabot baru masuk ke lantai 1.");
$("#f2").onclick=()=>setF("f2",true,true,1,"Lantai 2 aktif, lantai 1 tampil samar. Ruangan dan perabot baru masuk ke lantai 2.");
$("#f3").onclick=()=>setF("f3",true,false,null,"Lantai 1 dan 2 tampil. Lantai 2 berdinding kebiruan.");
$("#lb").onchange=e=>{RR.labels=e.target.checked;RR.build()};
$("#png").onclick=()=>RR.shot(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);
 a.download=(P.name||"desain").replace(/[^\w\- ]+/g,"").trim().replace(/ +/g,"-")+".png";a.click();URL.revokeObjectURL(a.href);status("Gambar tersimpan.")});

const hm=()=>new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
$("#sv").onclick=()=>{
 if(RR.save(P)){dirty=false;history.replaceState(null,"",location.pathname+"?id="+P.id);status("Tersimpan di browser ini pukul "+hm()+".")}
 else status("Gagal menyimpan di browser. Pakai Unduh file.")};
$("#lk").onclick=async()=>{
 const u=new URL("editor.html",location.href);u.search="";u.hash="";
 const t=u.href+"#d="+RR.enc(P);
 try{await navigator.clipboard.writeText(t);status("Tautan disalin ("+t.length+" karakter). Tautan memuat desain saat ini; kalau desain diubah, salin lagi.")}
 catch(e){prompt("Salin tautan ini:",t)}};
$("#ex2").onclick=()=>{const a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([JSON.stringify(P,null,1)],{type:"application/json"}));
 a.download=(P.name||"desain").replace(/[^\w\- ]+/g,"").trim().replace(/ +/g,"-")+".json";a.click();URL.revokeObjectURL(a.href);status("File diunduh.")};
addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue=""}});

RR.build();chips();fill();info();RR.view("p");mark(RR.upper?"f3":"f1");
})();
