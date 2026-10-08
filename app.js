const slides = [
  {type:"HOOK", text:"우리는 매일\n수많은 감정을\n지나갑니다."},
  {type:"QUESTION", text:"기뻤던 순간은\n사진으로 남기고,\n그때의 감정은\n어디에 남을까요?"},
  {type:"STATEMENT", text:"그래서 우리는\n감정을 기록합니다."},
  {type:"TRACE", text:"감정은 눈에 보이지 않지만\n분명 우리에게\n흔적을 남깁니다."},
  {type:"ONLINE", text:"그리고 이제\n그 기록을\n한곳에서 만나보세요."},
  {type:"ARCHIVE", text:"하나의 감정에서\n시작된 이야기"},
  {type:"REFLECTION", text:"오늘의 감정이\n언젠가 나를 설명하는\n기록이 될 수 있도록."},
  {type:"CTA", text:"당신에게도\n기록하고 싶은\n감정이 있나요?"}
];

let current = 0;
const card = document.querySelector("#card");
const counter = document.querySelector("#counter");
const dots = document.querySelector("#dots");

function render() {
  const slide = slides[current];
  card.querySelector(".card-label").textContent = String(current+1).padStart(2,"0")+" — "+slide.type;
  card.querySelector(".card h2").innerHTML = slide.text.replaceAll("\n","<br>");
  counter.textContent = String(current+1).padStart(2,"0")+" / "+String(slides.length).padStart(2,"0");
  dots.innerHTML = slides.map((_,i)=>'<span class="dot '+(i===current?"active":"")+'"></span>').join("");
}
document.querySelector("#prev").onclick=()=>{current=(current-1+slides.length)%slides.length;render()};
document.querySelector("#next").onclick=()=>{current=(current+1)%slides.length;render()};
document.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft") document.querySelector("#prev").click();
  if(e.key==="ArrowRight") document.querySelector("#next").click();
});

document.querySelector("#generate").onclick=()=>{
  const idea=document.querySelector("#idea").value.trim();
  if(!idea) {
    document.querySelector("#idea").focus();
    document.querySelector("#idea").placeholder="먼저 전하고 싶은 이야기를 입력해주세요.";
    return;
  }
  slides[0]={type:"HOOK",text:idea.length>55?idea.slice(0,55)+"…":idea};
  current=0;
  render();
  document.querySelector(".preview-section").scrollIntoView({behavior:"smooth",block:"center"});
};

const grid=document.querySelector("#sampleGrid");
slides.forEach((slide,i)=>{
  const item=document.createElement("div");
  item.className="sample-item";
  item.textContent=String(i+1).padStart(2,"0")+" — "+slide.type;
  grid.appendChild(item);
});
render();