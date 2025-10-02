const STORAGE_KEY="fluxo:contas:v1",BAL_KEY="fluxo:saldo_inicial:v1",THEME_KEY="fluxo:theme",HIDE_SALDO_KEY="fluxo:hide_saldo",HIDE_INIT_KEY="fluxo:hide_initial";
const listEl=document.getElementById("list"),saldoEl=document.getElementById("saldo"),initialInput=document.getElementById("initialBalance"),saveInitialBtn=document.getElementById("saveInitial"),newBtn=document.getElementById("newBtn"),modal=document.getElementById("modal"),form=document.getElementById("form"),closeModal=document.getElementById("closeModal"),modalTitle=document.getElementById("modalTitle"),f_desc=document.getElementById("f_desc"),f_val=document.getElementById("f_val"),f_date=document.getElementById("f_date"),deleteBtn=document.getElementById("deleteBtn"),filterStatus=document.getElementById("filterStatus"),searchInput=document.getElementById("search"),fileInput=document.getElementById("fileInput"),ocrBtn=document.getElementById("ocrBtn"),ocrText=document.getElementById("ocrText"),exportBtn=document.getElementById("exportBtn"),importBtn=document.getElementById("importBtn"),importFile=document.getElementById("importFile"),themeToggle=document.getElementById("themeToggle"),themeIcon=document.getElementById("themeIcon"),toggleSaldoBtn=document.getElementById("toggleSaldo"),eyeSaldo=document.getElementById("eyeSaldo"),toggleInitialBtn=document.getElementById("toggleInitial"),eyeInitial=document.getElementById("eyeInitial");

let editingId=null;

function loadContas(){return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}
function saveContas(a){localStorage.setItem(STORAGE_KEY,JSON.stringify(a));render()}
function getInitial(){return parseFloat(localStorage.getItem(BAL_KEY)||"0")}
function setInitial(v){localStorage.setItem(BAL_KEY,String(v));render()}

initialInput.value=getInitial();saveInitialBtn.onclick=()=>{setInitial(parseFloat(initialInput.value||"0"))}

// tema
function applyTheme(){const t=localStorage.getItem(THEME_KEY)||"dark";if(t==="light"){document.body.classList.add("light");themeIcon.innerHTML='<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'}else{document.body.classList.remove("light");themeIcon.innerHTML='<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'}}
applyTheme();themeToggle.onclick=()=>{const t=localStorage.getItem(THEME_KEY)||"dark";localStorage.setItem(THEME_KEY,t==="light"?"dark":"light");applyTheme()}

// ocultar saldos
function updateEye(el,h){if(h){el.innerHTML='<path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a20.4 20.4 0 013.06-3.95"/><path d="M1 1l22 22"/>'}else{el.innerHTML='<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'}}
let saldoHidden=localStorage.getItem(HIDE_SALDO_KEY)==="1",initHidden=localStorage.getItem(HIDE_INIT_KEY)==="1";updateEye(eyeSaldo,saldoHidden);updateEye(eyeInitial,initHidden);
toggleSaldoBtn.onclick=()=>{saldoHidden=!saldoHidden;localStorage.setItem(HIDE_SALDO_KEY,saldoHidden?"1":"0");updateEye(eyeSaldo,saldoHidden);render()}
toggleInitialBtn.onclick=()=>{initHidden=!initHidden;localStorage.setItem(HIDE_INIT_KEY,initHidden?"1":"0");updateEye(eyeInitial,initHidden);render()}

// saldo e contas
function calcularSaldo(){const contas=loadContas();const gastos=contas.filter(c=>c.status==="paid").reduce((s,c)=>s+(+c.amount||0),0);return getInitial()-gastos}
function formatBRL(v){return "R$ "+Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}
function render(){const contas=loadContas();const filter=filterStatus.value;const q=(searchInput.value||"").toLowerCase();const shown=contas.filter(c=>{if(filter==="pending"&&c.status!=="pending")return false;if(filter==="paid"&&c.status!=="paid")return false;if(q&&!c.title.toLowerCase().includes(q))return false;return true});listEl.innerHTML="";shown.forEach(c=>{const el=document.createElement("div");el.className="item "+(c.status==="paid"?"paid":"");el.innerHTML=`<div class="meta"><strong>${escapeHtml(c.title)}</strong><small>${c.due_date||""} • ${formatBRL(c.amount)}</small></div><div><button onclick="togglePaid(${c.id})">${c.status==="pending"?"Pagar":"Reabrir"}</button><button onclick="edit(${c.id})">Editar</button></div>`;listEl.appendChild(el)});saldoEl.innerText=saldoHidden?"••••":formatBRL(calcularSaldo());initialInput.type=initHidden?"password":"number"}
function escapeHtml(s=""){return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}

// ações
window.togglePaid=id=>{let a=loadContas();const i=a.findIndex(x=>x.id===id);if(i>-1){a[i].status=a[i].status==="pending"?"paid":"pending";saveContas(a)}}
window.edit=id=>{let a=loadContas();const c=a.find(x=>x.id===id);if(!c)return;editingId=id;modal.classList.remove("hidden");f_desc.value=c.title;f_val.value=c.amount;f_date.value=c.due_date||"";deleteBtn.style.display="block"}
newBtn.onclick=()=>{editingId=null;modal.classList.remove("hidden");form.reset();deleteBtn.style.display="none"}
closeModal.onclick=()=>modal.classList.add("hidden")
form.onsubmit=e=>{e.preventDefault();let a=loadContas();if(editingId){const i=a.findIndex(x=>x.id===editingId);a[i].title=f_desc.value;a[i].amount=parseFloat(f_val.value||"0");a[i].due_date=f_date.value}else{a.push({id:Date.now(),title:f_desc.value,amount:parseFloat(f_val.value||"0"),due_date:f_date.value,status:"pending"})}saveContas(a);modal.classList.add("hidden")}
deleteBtn.onclick=()=>{let a=loadContas();a=a.filter(x=>x.id!==editingId);saveContas(a);modal.classList.add("hidden")}
filterStatus.onchange=render;searchInput.oninput=render

// OCR
ocrBtn.onclick=()=>{const f=fileInput.files[0];if(!f)return alert("Selecione uma imagem");ocrText.innerText="Lendo...";Tesseract.recognize(f,"por").then(({data:{text}})=>{ocrText.innerText=text;const v=extrairValor(text);if(v){let a=loadContas();a.push({id:Date.now(),title:"Cupom OCR",amount:v,due_date:"",status:"pending"});saveContas(a)}})}
function extrairValor(t){const m=t.match(/(\d+[,\.]\d{2})/);return m?parseFloat(m[1].replace(",",".")):null}

// export/import
exportBtn.onclick=()=>{const blob=new Blob([JSON.stringify(loadContas())],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="contas.json";a.click();URL.revokeObjectURL(url)}
importBtn.onclick=()=>importFile.click()
importFile.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{localStorage.setItem(STORAGE_KEY,r.result);render()};r.readAsText(f)}

render();
