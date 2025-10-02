// Plataforma frontend-only: LocalStorage + Tesseract.js OCR
const STORAGE_KEY = "fluxo:contas:v1"
const BAL_KEY = "fluxo:saldo_inicial:v1"

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
const themeToggle = document.getElementById("themeToggle")
const toggleSaldoBtn = document.getElementById("toggleSaldo")
const toggleInitialBtn = document.getElementById("toggleInitial")

let editingId = null
let saldoHidden=false, initialHidden=false

// utils
function loadContas(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
function saveContas(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); render() }
function getInitial(){ return parseFloat(localStorage.getItem(BAL_KEY) || "1000") }
function setInitial(v){ localStorage.setItem(BAL_KEY, String(v)); render() }
initialInput.value = getInitial()
saveInitialBtn.onclick = ()=> setInitial(parseFloat(initialInput.value || "0"))

// tema
function applyTheme(theme){
  document.body.classList.toggle("light", theme==="light")
  themeToggle.textContent = theme==="light" ? "🌞" : "🌙"
}
const savedTheme = localStorage.getItem("theme") || "dark"
applyTheme(savedTheme)
themeToggle.onclick = ()=>{
  const t = document.body.classList.contains("light") ? "dark" : "light"
  localStorage.setItem("theme", t); applyTheme(t)
}

// esconder/mostrar saldo
toggleSaldoBtn.onclick=()=>{
  saldoHidden=!saldoHidden
  toggleSaldoBtn.textContent=saldoHidden?"🙈":"👁"
  render()
}
toggleInitialBtn.onclick=()=>{
  initialHidden=!initialHidden
  toggleInitialBtn.textContent=initialHidden?"🙈":"👁"
  initialInput.type = initialHidden ? "password" : "number"
}

// render
function calcularSaldo(){
  const contas = loadContas()
  const pagas = contas.filter(c=> c.status === "paid")
  const gastos = pagas.reduce((s,c)=> s + (Number(c.amount)||0), 0)
  return (Number(getInitial()) || 0) - gastos
}
function formatBRL(v){ return "R$ " + Number(v || 0).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2}) }
function render(){
  const contas = loadContas()
  const filter = filterStatus.value
  const q = (searchInput.value || "").toLowerCase()
  const shown = contas.filter(c=>{
    if(filter==="pending" && c.status!=="pending") return false
    if(filter==="paid" && c.status!=="paid") return false
    if(q && !(c.title||"").toLowerCase().includes(q)) return false
    return true
  })
  listEl.innerHTML=""
  shown.forEach(c=>{
    const el=document.createElement("div")
    el.className="item "+(c.status==="paid"?"paid":"")
    el.innerHTML=`
      <div class="meta">
        <strong>${escapeHtml(c.title)}</strong>
        <small>${c.due_date?c.due_date:""} • ${formatBRL(c.amount)}</small>
      </div>
      <div>
        <button onclick="togglePaid(${c.id})">${c.status==="pending"?"Pagar":"Reabrir"}</button>
        <button onclick="edit(${c.id})">Editar</button>
      </div>`
    listEl.appendChild(el)
  })
  saldoEl.innerText = saldoHidden ? "••••••" : formatBRL(calcularSaldo())
}

// helpers
function escapeHtml(s=''){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

// actions
window.togglePaid = function(id){
  const contas = loadContas()
  const i = contas.findIndex(x=>x.id===id)
  if(i<0) return
  contas[i].status = contas[i].status === "pending" ? "paid" : "pending"
  saveContas(contas)
}
window.edit = function(id){
  const contas = loadContas()
  const c = contas.find(x=>x.id===id)
  if(!c) return
  editingId = id
  modalTitle.innerText = "Editar Conta"
  f_desc.value = c.title
  f_val.value = c.amount
  f_date.value = c.due_date || ""
  deleteBtn.style.display = "inline-block"
  openModal()
}
newBtn.onclick = () => {
  editingId = null
  modalTitle.innerText = "Nova Conta"
  f_desc.value = ""
  f_val.value = ""
  f_date.value = ""
  deleteBtn.style.display = "none"
  openModal()
}
function openModal(){ modal.classList.remove("hidden"); modal.setAttribute("aria-hidden","false") }
function close(){ modal.classList.add("hidden"); modal.setAttribute("aria-hidden","true") }
closeModal.onclick = close
document.getElementById("modal").addEventListener("click", (e)=>{ if(e.target.id === "modal") close() })

form.onsubmit = (e) => {
  e.preventDefault()
 
