// Plataforma frontend-only
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
let saldoHidden = false
let initialHidden = false

// utils
function loadContas(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
function saveContas(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); render() }
function getInitial(){ return parseFloat(localStorage.getItem(BAL_KEY) || "1000") }
function setInitial(v){ localStorage.setItem(BAL_KEY, String(v)); render() }

initialInput.value = getInitial()
saveInitialBtn.onclick = ()=> { setInitial(parseFloat(initialInput.value || "0")) }

// saldo = saldo inicial - soma das contas pagas
function calcularSaldo(){
  const contas = loadContas()
  const gastos = contas.filter(c=>c.status==="paid").reduce((s,c)=> s + (Number(c.amount)||0),0)
  return (Number(getInitial())||0) - gastos
}

function formatBRL(v){ return "R$ " + Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2}) }

function render(){
  const contas = loadContas()
  const filter = filterStatus.value
  const q = (searchInput.value||"").toLowerCase()
  const shown = contas.filter(c=>{
    if(filter==="pending" && c.status!=="pending") return false
    if(filter==="paid" && c.status!=="paid") return false
    if(q && !(c.title||"").toLowerCase().includes(q)) return false
    return true
  })
  listEl.innerHTML=""
  shown.forEach(c=>{
    const el=document.createElement("div")
    el.className="item " + (c.status==="paid"?"paid":"")
    el.innerHTML=`
      <div class="meta">
        <strong>${escapeHtml(c.title)}</strong>
        <small>${c.due_date||""} • ${formatBRL(c.amount)}</small>
      </div>
      <div>
        <button onclick="togglePaid(${c.id})">${c.status==="pending"?"Pagar":"Reabrir"}</button>
        <button onclick="edit(${c.id})">Editar</button>
      </div>`
    listEl.appendChild(el)
  })
  saldoEl.innerText = saldoHidden ? "•••••" : formatBRL(calcularSaldo())
  initialInput.type = initialHidden ? "password" : "number"
}

// helpers
function escapeHtml(s=''){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

// actions
window.togglePaid = function(id){
  const contas=loadContas()
  const i=contas.findIndex(x=>x.id===id)
  if(i<0) return
  contas[i].status=contas[i].status==="pending"?"paid":"pending"
  saveContas(contas)
}
window.edit=function(id){
  const c=loadContas().find(x=>x.id===id)
  if(!c) return
  editingId=id
  modalTitle.innerText="Editar Conta"
  f_desc.value=c.title; f_val.value=c.amount; f_date.value=c.due_date||""
  deleteBtn.style.display="inline-block"; openModal()
}
newBtn.onclick=()=>{ editingId=null; modalTitle.innerText="Nova Conta"; f_desc.value=""; f_val.value=""; f_date.value=""; deleteBtn.style.display="none"; openModal() }
function openModal(){ modal.classList.remove("hidden"); modal.setAttribute("aria-hidden","false") }
function close(){ modal.classList.add("hidden"); modal.setAttribute("aria-hidden","true") }
closeModal.onclick=close
document.getElementById("modal").addEventListener("click",(e)=>{ if(e.target.id==="modal") close() })

form.onsubmit=(e)=>{ e.preventDefault(); const title=f_desc.value.trim(); const amount=parseFloat(f_val.value||"0"); const due_date=f_date.value||null; let contas=loadContas()
  if(editingId){ const i=contas.findIndex(x=>x.id===editingId); contas[i].title=title; contas[i].amount=amount; contas[i].due_date=due_date }
  else { contas.push({id:Date.now(),title,amount,due_date,status:"pending"}) }
  saveContas(contas); close()
}
deleteBtn.onclick=()=>{ if(!editingId)return; let contas=loadContas().filter(x=>x.id!==editingId); saveContas(contas); close() }

// OCR
ocrBtn.onclick=async()=>{ const file=fileInput.files[0]; if(!file)return alert("Selecione uma imagem."); ocrText.textContent="Processando OCR..."
  try{ const url=URL.createObjectURL(file); const res=await Tesseract.recognize(url,'por'); const txt=res.data?.text?.trim()||""; ocrText.textContent=txt||"Nenhum texto."
    const matches=txt.match(/\d{1,3}(?:[.\d{3}])*,\d{2}/g)||txt.match(/\d+,\d{2}/g)||[]; let val=matches[0]?.replace(".","").replace(",","."); if(val){ let contas=loadContas(); contas.push({id:Date.now(),title:"Cupom OCR",amount:parseFloat(val),due_date:null,status:"pending"}); saveContas(contas)} }
  catch(err){ ocrText.textContent="Erro OCR: "+err }
}

// export/import
exportBtn.onclick=()=>{ const data={saldo:getInitial(),contas:loadContas()}; const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url;a.download="financeiro.json";a.click();URL.revokeObjectURL(url) }
importBtn.onclick=()=>importFile.click()
importFile.onchange=(e)=>{ const file=e.target.files[0]; if(!file)return; const r=new FileReader(); r.onload=()=>{ try{ const data=JSON.parse(r.result); if(data.saldo)setInitial(data.saldo); if(Array.isArray(data.contas))saveContas(data.contas) }catch{alert("JSON inválido")} }; r.readAsText(file) }

// filtros
filterStatus.onchange=render; searchInput.oninput=render

// tema
themeToggle.onclick=()=>{ document.documentElement.classList.toggle("light"); themeToggle.textContent=document.documentElement.classList.contains("light")?"☀️":"🌙" }

// esconder/mostrar saldos
toggleSaldoBtn.onclick=()=>{ saldoHidden=!saldoHidden; toggleSaldoBtn.textContent=saldoHidden?"👁‍🗨":"👁"; render() }
toggleInitialBtn.onclick=()=>{ initialHidden=!initialHidden; toggleInitialBtn.textContent=initialHidden?"👁‍🗨":"👁"; render() }

// init
render()
