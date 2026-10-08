const templates = [
  {id:"image",name:"IMAGE",desc:"사진 중심",className:"t-image"},
  {id:"editorial",name:"EDITORIAL",desc:"사진 + 큰 타이포",className:"t-editorial"},
  {id:"archive",name:"ARCHIVE",desc:"사진 + 메타데이터",className:"t-archive"},
  {id:"story",name:"STORY",desc:"사진 + 이야기",className:"t-story"},
  {id:"product",name:"PRODUCT",desc:"제품 중심",className:"t-product"},
  {id:"full",name:"FULL BLEED",desc:"전체 이미지",className:"t-full"}
];

let currentTemplate="image";
let imageSrc="";
let slides=[{title:"불안을 입는다는 것",body:"감정을 숨기지 않고\n그대로 기록합니다.",meta:"MU:D ARCHIVE / 2026"}];
let currentSlide=0;

const $=s=>document.querySelector(s);
const esc=s=>String(s||"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
function renderTemplates(){
  $("#templateList").innerHTML=templates.map(t=>'<button class="template-btn '+(t.id===currentTemplate?"active":"")+'" data-id="'+t.id+'"><b>'+t.name+'</b><small>'+t.desc+'</small></button>').join("");
  document.querySelectorAll(".template-btn").forEach(b=>b.onclick=()=>{currentTemplate=b.dataset.id;render();});
  $("#library").innerHTML=templates.map(t=>'<button class="library-card '+t.className+'" data-id="'+t.id+'"><span>'+t.name+'</span><b>'+t.desc+'</b></button>').join("");
  document.querySelectorAll(".library-card").forEach(b=>b.onclick=()=>{currentTemplate=b.dataset.id;$("#editor").scrollIntoView({behavior:"smooth"});render();});
}
function loadFields(){
  const s=slides[currentSlide];
  $("#titleInput").value=s.title||"";
  $("#bodyInput").value=s.body||"";
  $("#metaInput").value=s.meta||"";
}
function render(){
  renderTemplates();
  const s=slides[currentSlide];
  const image=imageSrc?'<img src="'+imageSrc+'" style="object-position:'+$("#posX").value+'% '+$("#posY").value+'%;transform:scale('+Number($("#zoom").value)/100+')">':'<div class="empty-image">DROP<br>IMAGE</div>';
  $("#canvas").className="card-canvas "+templates.find(t=>t.id===currentTemplate).className;
  $("#canvas").innerHTML=image+
    '<div class="card-meta">'+esc(s.meta)+'</div>'+
    '<div class="card-copy"><h3>'+esc(s.title).replaceAll("\n","<br>")+'</h3><p>'+esc(s.body).replaceAll("\n","<br>")+'</p></div>'+
    '<div class="card-index">'+String(currentSlide+1).padStart(2,"0")+' / '+String(slides.length).padStart(2,"0")+'</div>';
  $("#templateName").textContent=templates.find(t=>t.id===currentTemplate).name;
  $("#slideList").innerHTML=slides.map((_,i)=>'<button class="'+(i===currentSlide?"active":"")+'">'+String(i+1).padStart(2,"0")+'</button>').join("");
  document.querySelectorAll("#slideList button").forEach((b,i)=>b.onclick=()=>{currentSlide=i;loadFields();render();});
  loadFields();
}
$("#imageInput").onchange=e=>{
  const file=e.target.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{imageSrc=reader.result;render();};
  reader.readAsDataURL(file);
};
["titleInput","bodyInput","metaInput"].forEach(id=>$("#"+id).oninput=()=>{
  slides[currentSlide][id.replace("Input","")]= $("#"+id).value; renderCanvasOnly();
});
["posX","posY","zoom"].forEach(id=>$("#"+id).oninput=renderCanvasOnly);
function renderCanvasOnly(){
  const s=slides[currentSlide];
  const c=$("#canvas");
  const img=c.querySelector("img");
  if(img){img.style.objectPosition=$("#posX").value+"% "+$("#posY").value+"%";img.style.transform="scale("+Number($("#zoom").value)/100+")";}
  const meta=c.querySelector(".card-meta"), h=c.querySelector("h3"), p=c.querySelector("p");
  if(meta)meta.textContent=s.meta||"";
  if(h)h.innerHTML=esc(s.title).replaceAll("\n","<br>");
  if(p)p.innerHTML=esc(s.body).replaceAll("\n","<br>");
}
$("#addSlide").onclick=()=>{slides.push({title:"새로운 이야기",body:"여기에 내용을 입력하세요.",meta:"MU:D ARCHIVE"});currentSlide=slides.length-1;render();};
$("#duplicate").onclick=()=>{slides.push({...slides[currentSlide]});currentSlide=slides.length-1;render();};
$("#download").onclick=async()=>{
  const c=$("#canvas"); const clone=c.cloneNode(true);
  clone.style.position="fixed";clone.style.left="-10000px";clone.style.width="1080px";clone.style.height="1350px";
  document.body.appendChild(clone);
  const script=document.createElement("script");
  script.src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
  document.head.appendChild(script);
  await new Promise(r=>script.onload=r);
  const canvas=await window.html2canvas(clone,{width:1080,height:1350,scale:1,useCORS:true});
  const a=document.createElement("a");a.download="mud-archive-"+String(currentSlide+1).padStart(2,"0")+".png";a.href=canvas.toDataURL("image/png");a.click();
  clone.remove();
};
render();