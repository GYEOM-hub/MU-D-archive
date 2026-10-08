const defaultSlides = [
  {type:"HOOK", text:"우리는 매일\n수많은 감정을\n지나갑니다."},
  {type:"QUESTION", text:"기뻤던 순간은\n사진으로 남기고,\n그때의 감정은\n어디에 남을까요?"},
  {type:"STATEMENT", text:"그래서 우리는\n감정을 기록합니다."},
  {type:"TRACE", text:"감정은 눈에 보이지 않지만\n분명 우리에게\n흔적을 남깁니다."},
  {type:"ONLINE", text:"그리고 이제\n그 기록을\n한곳에서 만나보세요."},
  {type:"ARCHIVE", text:"하나의 감정에서\n시작된 이야기"},
  {type:"REFLECTION", text:"오늘의 감정이\n언젠가 나를 설명하는\n기록이 될 수 있도록."},
  {type:"CTA", text:"당신에게도\n기록하고 싶은\n감정이 있나요?"}
];

let slides = [...defaultSlides];
let current = 0;

const card = document.querySelector("#card");
const counter = document.querySelector("#counter");
const dots = document.querySelector("#dots");
const idea = document.querySelector("#idea");
const generate = document.querySelector("#generate");

function render() {
  const slide = slides[current];
  card.querySelector(".card-label").textContent =
    String(current + 1).padStart(2, "0") + " — " + (slide.type || "SLIDE");
  card.querySelector(".card h2").innerHTML =
    (slide.text || "").replaceAll("\\n", "<br>");
  counter.textContent =
    String(current + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
  dots.innerHTML = slides.map((_, i) =>
    '<button class="dot ' + (i === current ? "active" : "") + '" data-index="' + i + '" aria-label="slide ' + (i + 1) + '"></button>'
  ).join("");
  dots.querySelectorAll(".dot").forEach(btn => {
    btn.onclick = () => { current = Number(btn.dataset.index); render(); };
  });
}

function showStatus(message) {
  let status = document.querySelector("#status");
  if (!status) {
    status = document.createElement("p");
    status.id = "status";
    status.className = "status-message";
    generate.parentElement.appendChild(status);
  }
  status.textContent = message;
}

document.querySelector("#prev").onclick = () => {
  current = (current - 1 + slides.length) % slides.length;
  render();
};

document.querySelector("#next").onclick = () => {
  current = (current + 1) % slides.length;
  render();
};

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") document.querySelector("#prev").click();
  if (e.key === "ArrowRight") document.querySelector("#next").click();
});

generate.onclick = async () => {
  const value = idea.value.trim();
  if (!value) {
    idea.focus();
    showStatus("먼저 전하고 싶은 이야기를 입력해주세요.");
    return;
  }

  generate.disabled = true;
  generate.innerHTML = "GENERATING... <span>· · ·</span>";
  showStatus("MU:D ARCHIVE의 언어로 이야기를 구성하고 있어.");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({idea: value, count: 8})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "생성에 실패했습니다.");

    slides = data.slides;
    current = 0;
    render();
    showStatus("완료. 아래 카드에서 각 장면을 확인해봐.");
    document.querySelector(".preview-section").scrollIntoView({behavior:"smooth", block:"center"});
  } catch (error) {
    showStatus(error.message);
  } finally {
    generate.disabled = false;
    generate.innerHTML = "GENERATE CARD NEWS <span>→</span>";
  }
};

const grid = document.querySelector("#sampleGrid");
function renderSampleGrid() {
  grid.innerHTML = "";
  slides.forEach((slide, i) => {
    const item = document.createElement("button");
    item.className = "sample-item";
    item.innerHTML = "<span>" + String(i + 1).padStart(2, "0") + " — " + (slide.type || "SLIDE") + "</span><strong>" +
      (slide.text || "").replaceAll("\\n", "<br>") + "</strong>";
    item.onclick = () => {
      current = i;
      render();
      document.querySelector(".preview-section").scrollIntoView({behavior:"smooth", block:"center"});
    };
    grid.appendChild(item);
  });
}

renderSampleGrid();
render();
