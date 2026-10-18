/* Halaman depan */
(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const go=id=>{location.href="editor.html?id="+encodeURIComponent(id)};
function render(){
 const a=RR.all().sort((x,y)=>y.upd-x.upd);
 $("#cont").disabled=!a.length;
 $("#contS").textContent=a.length?"Buka: "+a[0].name:"Belum ada desain tersimpan di browser ini";
 $("#lh").hidden=!a.length;
 $("#list").innerHTML=a.map(p=>'<div class="proj"><div><b>'+esc(p.name)+'</b><div class="mut">'+p.rooms.length+" ruangan · "+new Date(p.upd).toLocaleDateString("id-ID")+
  '</div></div><div class="row"><button data-o="'+esc(p.id)+'">Buka</button><button class="danger" data-d="'+esc(p.id)+'">Hapus</button></div></div>').join("");
 $("#list").querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>go(b.dataset.o));
 $("#list").querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const p=RR.get(b.dataset.d);if(p&&confirm('Hapus "'+p.name+'"? Ini tidak bisa dibatalkan.')){RR.del(p.id);render()}});
}
$("#cont").onclick=()=>{const a=RR.all().sort((x,y)=>y.upd-x.upd);if(a.length)go(a[0].id)};
$("#new").onclick=()=>$("#dlg").showModal();
$("#cancel").onclick=()=>$("#dlg").close();
$("#ok").onclick=()=>{
 const v=id=>$(id).value,c=id=>$(id).checked,nm=v("#nn").trim()||"Rumah saya";
 const w=Math.min(200,Math.max(5,parseFloat(v("#nw"))||10)),d=Math.min(200,Math.max(6,parseFloat(v("#nd"))||15));
 const p=v("#ns")==="kosong"?RR.make(nm,w,d,false):RR.gen({name:nm,w,d,fl:+v("#nl"),uk:v("#nu"),kamar:+v("#nk"),km:+v("#nm"),cp:+v("#nc"),kd:v("#nkd"),
  teras:c("#c_teras"),tamu:c("#c_tamu"),kel:c("#c_kel"),makan:c("#c_makan"),dapur:c("#c_dapur"),kerja:c("#c_kerja"),musala:c("#c_musala"),gudang:c("#c_gudang"),cuci:c("#c_cuci"),balkon:c("#c_balkon"),furn:c("#c_furn")});
 if(RR.save(p))go(p.id);else alert("Browser menolak menyimpan. Coba tutup mode privat.")};
$("#open").onclick=()=>$("#fi").click();
$("#fi").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
 r.onload=()=>{try{const p=RR.norm(JSON.parse(r.result));RR.save(p);go(p.id)}catch(x){alert("File tidak valid.")}};r.readAsText(f);e.target.value=""};
render();
})();
