(function(){
const $=s=>document.querySelector(s), rub=n=>Math.round(n).toLocaleString("ru-RU")+" ₽", fix=n=>n.toLocaleString("ru-RU",{maximumFractionDigits:2});
const gradeById=id=>GRADES.find(g=>g.id===id);
/* Контакты */
document.querySelectorAll("[data-tel]").forEach(a=>{a.href="tel:"+SITE.phoneRaw;a.textContent=a.dataset.label==="phone"?SITE.phone:a.dataset.label?"Позвонить "+SITE.phone:"Позвонить"});
const waLink=t=>"https://wa.me/"+SITE.whatsapp+(t?"?text="+encodeURIComponent(t):"");
$("#barWa").href=waLink();
$("#fAddress").textContent=SITE.address;$("#heroHours").textContent="Режим работы: "+SITE.hours;$("#heroAddr").textContent=SITE.address;
$("#contactList").innerHTML=[["Адрес",SITE.address],["Телефон",`<a href="tel:${SITE.phoneRaw}">${SITE.phone}</a>`],["WhatsApp",`<a href="${waLink()}">Написать</a>`],["Режим работы",SITE.hours]].map(([a,b])=>`<div class="card"><b>${a}</b><br>${b}</div>`).join("");
const d=0.01;$("#map").innerHTML=`<iframe title="Карта" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=${SITE.mapLon-d},${SITE.mapLat-d},${SITE.mapLon+d},${SITE.mapLat+d}&marker=${SITE.mapLat},${SITE.mapLon}"></iframe>`;
/* Подбор */
const opts=GRADES.map(g=>`<option value="${g.id}">${g.m} / ${g.b} — ${rub(g.price)}</option>`).join("");
$("#cGrade").innerHTML=opts;$("#fGrade").innerHTML=opts;$("#cGrade").value="m250";$("#fGrade").value="m250";
$("#tasks").innerHTML=TASKS.map(t=>`<button class="card task" type="button" aria-pressed="false" data-id="${t.id}"><b>${t.title}</b><span>${t.sub||"&nbsp;"}</span></button>`).join("");
$("#tasks").onclick=e=>{const b=e.target.closest(".task");if(!b)return;const t=TASKS.find(x=>x.id===b.dataset.id),g=gradeById(t.grade);
 document.querySelectorAll(".task").forEach(x=>x.setAttribute("aria-pressed",x===b));
 const r=$("#reco");r.hidden=false;r.innerHTML=`<h3>Рекомендуем ${g.m} (${g.b})</h3><p>${t.why}</p><button class="btn small" type="button" id="seePrice">Посмотреть цену</button>`;
 $("#seePrice").onclick=()=>{$("#flt").value="";render();const c=$("#g-"+g.id);openCard(c);c.scrollIntoView({behavior:"smooth",block:"center"});c.classList.remove("hl");void c.offsetWidth;c.classList.add("hl")}};
/* Каталог */
const uses={found:"Фундамент",screed:"Стяжка",path:"Дорожки",slab:"Перекрытия",fence:"Забор",pool:"Бассейн, подвал",floor:"Пром. полы",prep:"Подготовка"};
$("#flt").innerHTML+=Object.entries(uses).map(([k,v])=>`<option value="${k}">${v}</option>`).join("");
function render(){let l=GRADES.filter(g=>!$("#flt").value||g.tags.includes($("#flt").value));const s=$("#sort").value;
 l.sort((a,b)=>s==="asc"?a.price-b.price:s==="desc"?b.price-a.price:GRADES.indexOf(a)-GRADES.indexOf(b));
 $("#cards").innerHTML=l.map(g=>`<article class="card gc" id="g-${g.id}"><button class="gh" type="button" aria-expanded="false" aria-controls="d-${g.id}"><span class="gm">${g.m}</span><span class="gb">${g.b}</span><span class="str" title="Прочность"><i style="width:${(GRADES.indexOf(g)+1)/GRADES.length*100}%"></i></span><span class="price">${rub(g.price)}<small> / м³</small></span><span class="more">Подробнее</span></button>
 <div class="gd" id="d-${g.id}"><div><div class="tags"><span>${g.f}</span><span>${g.w}</span><span>${g.p}</span></div><p>${g.desc}</p><p><b>Применение:</b> ${g.use}</p>
 <div class="btns"><button class="btn small" type="button" data-add="${g.id}">Добавить в расчёт</button><button class="btn small ghost" style="color:var(--ink)" type="button" data-ord="${g.id}">Заказать</button></div></div></div></article>`).join("")}
function setOpen(c,on){c.classList.toggle("open",on);c.querySelector(".gh").setAttribute("aria-expanded",on)}
function openCard(c){document.querySelectorAll("#cards .open").forEach(x=>{if(x!==c)setOpen(x,false)});setOpen(c,true)}
$("#sort").onchange=$("#flt").onchange=render;render();
$("#cards").onclick=e=>{const gh=e.target.closest(".gh");if(gh){const c=gh.parentNode,was=c.classList.contains("open");document.querySelectorAll("#cards .open").forEach(x=>setOpen(x,false));if(!was)setOpen(c,true);return}const a=e.target.dataset;if(a.add){$("#cGrade").value=a.add;calc();$("#calc").scrollIntoView()}if(a.ord){$("#fGrade").value=a.ord;$("#order").scrollIntoView()}};
/* Калькулятор: единицы указаны в подписях полей (м или см) */
const TYPES={
 slab:{n:"Плита / стяжка / площадка",f:[["Длина, м"],["Ширина, м"],["Толщина, см"]],v:(a,b,c)=>a*b*c/100},
 strip:{n:"Ленточный фундамент",f:[["Периметр, м"],["Ширина, см"],["Высота, м"]],v:(a,b,c)=>a*b/100*c},
 pillar:{n:"Круглые столбы",f:[["Диаметр, см"],["Высота, м"],["Количество, шт"]],v:(a,b,c)=>Math.PI*Math.pow(a/200,2)*b*c},
 column:{n:"Колонна / прямоугольный элемент",f:[["Сторона A, см"],["Сторона B, см"],["Высота, м"],["Количество, шт"]],v:(a,b,c,n)=>a/100*b/100*c*n}};
function fillZones(q){const cur=$("#cZone").value;q=(q||"").trim().toLowerCase();
 const list=ZONES.map((z,i)=>({z,i})).filter(o=>o.z.name.toLowerCase().includes(q)).sort((a,b)=>a.z.name.localeCompare(b.z.name,"ru"));
 $("#cZone").innerHTML='<option value="">Выберите населённый пункт</option>'+list.map(o=>`<option value="${o.i}">${o.z.name} — ${rub(o.z.price)}${ZONES_PER_MIXER?" за миксер":""}</option>`).join("")+'<option value="km">Другой пункт — посчитать по км</option>';
 if(q&&list.length)$("#cZone").value=String(list[0].i);else if([...$("#cZone").options].some(o=>o.value===cur))$("#cZone").value=cur}
$("#zSearch").oninput=e=>{fillZones(e.target.value);syncZone()};fillZones("");
function zoneMode(){return $("#cZone").value!=="km"} // true: цена из таблицы или пункт не выбран
function syncZone(){$("#kmBox").hidden=zoneMode();calc()}
$("#cZone").onchange=syncZone;
let rows=[];$("#cRes").value=SITE.defaultReserve;$("#cKm").value=SITE.defaultKm;
function addRow(){rows.push({t:"slab",x:[6,4,20,1]});drawRows();calc()}
function drawRows(){$("#rows").innerHTML=rows.map((r,i)=>{const T=TYPES[r.t];return `<div class="row" data-i="${i}"><div><label>Конструкция</label><select data-t>${Object.entries(TYPES).map(([k,v])=>`<option value="${k}"${k===r.t?" selected":""}>${v.n}</option>`).join("")}</select></div>`+
 T.f.map((f,j)=>`<div><label>${f[0]}</label><input data-j="${j}" type="number" min="0" step="any" inputmode="decimal" value="${r.x[j]??""}"></div>`).join("")+`<div class="noprint"><button class="btn small ghost" style="color:var(--ink)" type="button" data-del>Удалить</button></div></div>`}).join("")}
$("#rows").oninput=e=>{const i=e.target.closest(".row").dataset.i;if(e.target.dataset.j!==undefined)rows[i].x[e.target.dataset.j]=e.target.value;calc()};
$("#rows").onchange=e=>{const i=e.target.closest(".row").dataset.i;if(e.target.dataset.t!==undefined){rows[i]={t:e.target.value,x:[]};drawRows();calc()}};
$("#rows").onclick=e=>{if(e.target.dataset.del!==undefined){rows.splice(e.target.closest(".row").dataset.i,1);if(!rows.length)rows.push({t:"slab",x:[]});drawRows();calc()}};
$("#addRow").onclick=()=>{rows.push({t:"slab",x:[]});drawRows()};
/* Подбор миксеров: сначала большие, остаток добираем малым (или ещё одним большим, если остаток больше малого) */
function mixers(vol){const [big,small]=SITE.mixerSizes;let nb=Math.floor(vol/big+1e-9),r=vol-nb*big,ns=0;
 if(r>1e-9){if(r<=small)ns=1;else nb++}
 const t=[];if(nb)t.push(nb+"×"+big+" м³");if(ns)t.push(ns+"×"+small+" м³");
 return{n:nb+ns,text:t.length?t.join(" + "):"—"}}
let last={};
function calc(){let v=0,bad=false;
 rows.forEach((r,i)=>{const T=TYPES[r.t],n=T.f.map((_,j)=>parseFloat(r.x[j]));const el=$("#rows").children[i];
  const ok=n.every(x=>x>0);r.v=ok?T.v(...n):0;if(!ok&&r.x.some(x=>x!==""&&x!==undefined))bad=true;
  if(el)el.querySelectorAll("input").forEach((inp,j)=>inp.setCustomValidity(n[j]>0||inp.value===""?"":"Введите число больше 0"));v+=r.v});
 const res=Math.max(0,parseFloat($("#cRes").value)||0),vr=v*(1+res/100),g=gradeById($("#cGrade").value),pl=mixers(vr),mix=pl.n,cost=vr*g.price,km=Math.max(0,parseFloat($("#cKm").value)||0),
  zv=$("#cZone").value,zone=ZONES[zv],
  del=vr<=0?0:zone?zone.price*(ZONES_PER_MIXER?mix:1):zv==="km"?SITE.deliveryBase+km*SITE.deliveryPerKm*(SITE.deliveryPerKmByMixer?mix:1):0,
  dLabel=zone?zone.name:zv==="km"?fix(km)+" км":"выберите пункт";
 last={v,vr,g,mix,pl,cost,del,res,km,dLabel};
 $("#res").innerHTML=`<div>Объём без запаса<b>${fix(v)} м³</b></div><div>Объём с запасом ${res}%<b>${fix(vr)} м³</b></div><div>Миксеры<b>${pl.text}</b></div><div>Бетон ${g.m}<b>${rub(cost)}</b></div><div>Доставка: ${dLabel}<b>${zv?rub(del):"—"}</b></div><div class="tot">Итого<b>${rub(cost+del)}</b></div>`+(bad?`<div>Проверьте ввод<b>Все значения больше 0</b></div>`:"")}
/* Определение расстояния по геолокации: по прямой (формула гаверсинуса) × поправка на дороги */
function straightKm(lat1,lon1,lat2,lon2){const R=6371,r=x=>x*Math.PI/180,dLat=r(lat2-lat1),dLon=r(lon2-lon1),
 a=Math.sin(dLat/2)**2+Math.cos(r(lat1))*Math.cos(r(lat2))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(a))}
$("#geo").onclick=()=>{const m=$("#geoMsg");
 if(!navigator.geolocation){m.textContent="Браузер не поддерживает определение места. Введите километры вручную.";return}
 m.textContent="Определяем местоположение…";
 navigator.geolocation.getCurrentPosition(p=>{
  const km=Math.max(1,Math.round(straightKm(SITE.mapLat,SITE.mapLon,p.coords.latitude,p.coords.longitude)*SITE.roadFactor));
  $("#cKm").value=km;calc();
  m.textContent="Примерно "+km+" км по дороге. Это ориентир: если бетон нужен в другом месте, поправьте число вручную."},
 ()=>{m.textContent="Не удалось определить местоположение (доступ запрещён или сайт открыт не по https). Введите километры вручную."},
 {enableHighAccuracy:false,timeout:10000,maximumAge:60000})};
$("#cGrade").onchange=$("#cRes").oninput=$("#cKm").oninput=calc;
$("#toOrder").onclick=()=>{$("#fGrade").value=last.g.id;$("#fVol").value=last.vr.toFixed(2);
 $("#fCom").value="Расчёт: "+rows.filter(r=>r.v).map(r=>`${TYPES[r.t].n} ${fix(r.v)} м³`).join("; ")+`; запас ${last.res}%; доставка: ${last.dLabel}`;$("#order").scrollIntoView()};
$("#print").onclick=()=>window.print();
/* Форма: маска телефона и отправка через WhatsApp (при необходимости замените на свой бэкенд / Telegram-бота) */
$("#fPhone").oninput=e=>{let d=e.target.value.replace(/\D/g,"");if(d[0]==="8"||d[0]==="7")d=d.slice(1);d=d.slice(0,10);
 let s="+7";if(d.length)s+=" ("+d.slice(0,3);if(d.length>=3)s+=") "+d.slice(3,6);if(d.length>=6)s+="-"+d.slice(6,8);if(d.length>=8)s+="-"+d.slice(8,10);e.target.value=s};
$("#form").onsubmit=e=>{e.preventDefault();const f=id=>$(id).value.trim();
 if(!f("#fName")||f("#fPhone").replace(/\D/g,"").length<11||!$("#fAgree").checked){alert("Укажите имя, телефон полностью и дайте согласие на обработку данных.");return}
 const g=gradeById($("#fGrade").value);
 const t=`Заявка с сайта\nИмя: ${f("#fName")}\nТелефон: ${f("#fPhone")}\nМарка: ${g.m}\nОбъём: ${f("#fVol")||"—"} м³\nАдрес: ${f("#fAddr")||"—"}\nДата: ${f("#fDate")||"—"}\nКомментарий: ${f("#fCom")||"—"}`;
 /* TODO: здесь можно отправить t на сервер через fetch(...) */
 $("#ok").hidden=false;window.open(waLink(t),"_blank","noopener")};
syncZone();addRow();
/* Анимация появления блоков при прокрутке и пауза анимации сцены при «уменьшении движения» */
const still=matchMedia("(prefers-reduced-motion:reduce)").matches;
if(still){const sc=$(".scene");sc&&sc.pauseAnimations&&sc.pauseAnimations()}
else if("IntersectionObserver"in window){const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{threshold:.12});
 document.querySelectorAll("section h2,section .lead,.steps li,#tasks>*,#cards>*,#about .card,#contactList>*,#order form,.next").forEach((el,i)=>{el.classList.add("rv");el.style.transitionDelay=(i%4)*70+"ms";io.observe(el)})}
})();
