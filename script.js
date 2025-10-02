// Plataforma frontend-only: LocalStorage + Tesseract.js OCR
const STORAGE_KEY = "fluxo:contas:v1"
const BAL_KEY = "fluxo:saldo_inicial:v1"
const THEME_KEY = "fluxo:theme"
const HIDE_SALDO_KEY = "fluxo:hide_saldo"
const HIDE_INIT_KEY = "fluxo:hide_initial"

const listEl = document.getElementById("list")
const saldoEl = document.getElementById("saldo")
const initialInput = document.getElementById("initialBalance")
const saveInitialBtn = document.getElementById("saveInitial")
const newBtn = document.getElementById("newBtn")
const modal = document.getElementById("modal")
const form = document.getElementById("form")
const closeModal = document.getElementById("closeModal")
const modalTitle = document.getElementById("modalTitle")
const f_desc = document.getElementById("f_desc")
const f_val = document.getElementById("f_val")
const f_date = document.getElementById("f_date")
const deleteBtn = document.getElementById("deleteBtn")
const filterStatus = document.getElementById("filterStatus")
const searchInput = document.getElementById("search")
const fileInput = document.getElementById("fileInput")
const ocrBtn = document.getElementById("ocrBtn")
const ocrText = document.getElementById("ocrText")
const exportBtn = document.getElementById("exportBtn")
const importBtn = document.getElementById("importBtn")
const importFile = document.getElementById("importFile")

// novos elementos
const themeToggle = document.getElementById("themeToggle")
const themeIcon = document.getElementById("themeIcon")
const toggleSaldoBtn = document.getElementById("toggleSaldo")
const eyeSaldo = document.getElementById("eyeSaldo")
const toggleInitialBtn = document.getElementById("toggleInitial")
const eyeInitial = document.getElementById("eyeInitial")

let editingId = null

// utils
function loadContas(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
function saveContas(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); render() }
function getInitial(){ return parseFloat(localStorage.getItem(BAL_KEY) || "1000") }
function setInitial(v){ localStorage.setItem(BAL_KEY, String(v)); render() }
initialInput.value = getInitial()
saveInitialBtn.onclick = ()=> { setInitial(parseFloat(initialInput.value||"0")) }

// tema
function applyTheme(){
  const t = localStorage.getItem(THEME_KEY) || "dark"
  if(t==="light"){
    document.body.classList.add("light")
    themeIcon.innerHTML='<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'
  }else{
    document.body.classList.remove("light")
    themeIcon.innerHTML='<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'
  }
}
applyTheme()
themeToggle.onclick=()=>{
  const t = localStorage.getItem(THEME_KEY) || "dark"
  localStorage.setItem(THEME_KEY, t==="light"?"dark":"light")
  applyTheme()
}

// ocultar saldos
function updateEye(el,hidden){
  if(hidden){
    el.innerHTML='<path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a20.4 20.4 0 013.06-3.95"/><path d="M1 1l22 22"/>';
  }else{
    el.innerHTML='<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'
  }
}
let saldoHidden = localStorage.getItem(HIDE_SALDO_KEY)==="1"
let initHidden = localStorage.getItem(HIDE_INIT_KEY)==="1"
updateEye(eyeSaldo,saldoHidden)
updateEye(eyeInitial,initHidden)

toggleSaldoBtn.onclick=()=>{
  saldoHidden=!saldoHidden
  localStorage.setItem(HIDE_SALDO_KEY,saldoHidden?"1":"0")
  updateEye(eyeSaldo,saldoHidden)
  render()
}
toggleInitialBtn.onclick=()=>{
  initHidden=!initHidden
  localStorage.setItem(HIDE_INIT_KEY,initHidden?"1":"0")
  updateEye(eyeInitial,initHidden)
  render()
}

// render saldo
function calcularSaldo(){
  const contas = loadContas()
  const gastos = contas.filter(c=>c.status==="paid").reduce((s,c)=>s+(+c.amount||0),0)
  return getInitial()-gastos
}
function formatBRL(v){return "R$ "+Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}
function render(){
  const contas = loadContas()
  const filter=filterStatus.value
  const q=(searchInput.value||"").toLowerCase()
  const shown=contas.filter(c=>{
    if(filter==="pending"&&c.status!=="pending")return false
    if(filter==="paid"&&c.status!=="paid")return false
    if(q&&!c.title.toLowerCase().includes(q))return false
    return true
  })
  listEl.innerHTML=""
  shown.forEach(c=>{
    const el=document.createElement("div")
    el.className="item "+(c.status==="paid"?"paid":"")
    el.innerHTML=`<div class="meta"><strong>${escapeHtml(c.title)}</strong><small>${c.due_date||""} • ${formatBRL(c.amount)}</small></div><div><button onclick="togglePaid(${c.id})">${c.status==="pending"?"Pagar":"Reabrir"}</button><button onclick="edit(${c.id})">Editar</button></div>`
    listEl.appendChild(el)
  })
  saldoEl.innerText = saldoHidden?"••••":formatBRL(calcularSaldo())
  initialInput.type= initHidden?"password":"number"
}
function escapeHtml(s=''){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}

// resto do código original permanece igual...
// togglePaid, edit, modal, OCR, import/export, etc (sem alteração)

// manter tudo igual ao seu script original abaixo desta linha
