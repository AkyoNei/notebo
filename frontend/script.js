const revealElements = document.querySelectorAll(".reveal, .reveal-up");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver.observe(el));

function smoothScroll(targetY, duration = 600) {
  const startY = window.pageYOffset;
  const diff = targetY - startY;
  let start;

  function easeInOutQuad(t) {
    return t < 0.5 
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t;
  }

  function step(timestamp) {
    if (!start) start = timestamp;
    const time = timestamp - start;
    const percent = Math.min(time / duration, 1);
    const eased = easeInOutQuad(percent);

    window.scrollTo(0, startY + diff * eased);
    if (time < duration) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    const offset = target.offsetTop - 80;
    smoothScroll(offset);
  });
});

  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');

  setTimeout(() => {
    preloader.classList.add('hide');

    setTimeout(() => {
      startNavTyping();
    }, 800); 

  }, 500); 
});

const schedules={
weekday:[
{start:"06:20",end:"15:20",task:"school"},
{start:"15:30",end:"16:00",task:"free"},
{start:"16:00",end:"17:30",task:"coding"},
{start:"17:30",end:"18:30",task:"free"},
{start:"18:30",end:"20:00",task:"general studies"},
{start:"20:00",end:"20:20",task:"shower"},
{start:"20:20",end:"20:35",task:"yoga"},
{start:"20:35",end:"22:00",task:"japanese"},
{start:"22:00",end:"23:00",task:"free"}
],

weekend:[
{start:"07:00",end:"08:30",task:"free"},
{start:"08:30",end:"09:30",task:"coding"},
{start:"09:30",end:"10:30",task:"free"},
{start:"10:30",end:"12:00",task:"general studies"},
{start:"12:00",end:"14:30",task:"free"},
{start:"14:30",end:"15:30",task:"japanese"},
{start:"15:30",end:"20:00",task:"free"},
{start:"16:30",end:"16:50",task:"yoga"},
{start:"20:00",end:"20:20",task:"shower"},
{start:"20:20",end:"00:00",task:"free"}
]
};

function todayKey(){
  return new Date().toISOString().split("T")[0];
}

function getTodaySchedule(){
  const d=new Date().getDay();
  return (d>=1&&d<=5)?schedules.weekday:schedules.weekend;
}

function loadProgress(){
  return JSON.parse(localStorage.getItem(todayKey()))||{};
}

function saveProgress(data){
  localStorage.setItem(todayKey(),JSON.stringify(data));
}

const container=document.getElementById("schedule");

function render(){

  container.innerHTML="";
  const list=getTodaySchedule();
  const progress=loadProgress();

  list.forEach((item,i)=>{

    const div=document.createElement("div");
    div.className="task";
    div.id="task-"+i;
    div.innerText=`${item.start} - ${item.end} | ${item.task}`;

    if(progress[i]) div.classList.add("done");

    div.onclick=()=>{
      progress[i]=!progress[i];
      saveProgress(progress);
      div.classList.toggle("done");
      updateDots();
    };

    container.appendChild(div);
  });

  createDots();
}

function createDots(){

  const dots=document.getElementById("dots");
  dots.innerHTML="";

  getTodaySchedule().forEach((_,i)=>{

    const span=document.createElement("div"); // ← ubah
    span.className="dot";
    span.id="dot-"+i;

    dots.appendChild(span);
  });

  updateDots();
}

function updateDots(){

  const progress = loadProgress();
  const list = getTodaySchedule();

  list.forEach((_,i)=>{
    const d = document.getElementById("dot-"+i);
    if(!d) return;

    d.classList.remove("done");

    if(progress[i]){
      d.classList.add("done");
    }
  });
}

function toMinutes(t){
  let[h,m]=t.split(":").map(Number);
  if(h===0)h=24;
  return h*60+m;
}

function updateActive(){
  const list=getTodaySchedule();
  const now=new Date();
  const nowMin=now.getHours()*60+now.getMinutes();

  list.forEach((task,i)=>{
    const el=document.getElementById("task-"+i);
    if(!el)return;
    el.classList.remove("active");

    if(nowMin>=toMinutes(task.start)&&nowMin<toMinutes(task.end)){
      el.classList.add("active");
    }
  });
}

function updateTimeline(){

  const now=new Date();
  const minutes=now.getHours()*60+now.getMinutes();
  const percent=(minutes/(24*60))*100;

  document.getElementById("timelineBar").style.width=percent+"%";
  document.getElementById("timelineDot").style.left=percent+"%";
}

function updateHeader(){
  document.getElementById("today").innerText=new Date().toDateString();
}

let currentDay=todayKey();

function checkDayChange(){
  if(todayKey()!==currentDay){
    currentDay=todayKey();
    render();
  }
}

render();
updateHeader();
updateActive();
updateTimeline();

setInterval(()=>{
  updateActive();
  updateTimeline();
  updateHeader();
  checkDayChange();
},1000);
