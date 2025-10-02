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
const saldoEye = document.getElementById("saldoEye")
const initialEye = document.getElementById("initialEye")

let editingId = null
let saldoHidden = false
let initialHidden = false

// utils
function loadContas(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") }
function saveContas(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); render() }
function getInitial(){ return parseFloat(localStorage.getItem(BAL_KEY) || "1000") }
function setInitial(v){ localStorage.setItem(BAL_KEY, String(v)); render() }

initialInput.value = getInitial()
saveInitialBtn.onclick = ()=> {
  const v = parseFloat(initialInput.value || "0")
  setInitial(v)
}

// saldo
function calcularSaldo(){
  const contas = loadContas()
  const pagas = contas.filter(c=> c.status === "paid")
  const gastos = pagas.reduce((s,c)=> s + (Number(c.amount)||0), 0)
  return (Number(getInitial()) || 0) - gastos
}
function formatBRL(v){
  return "R$ " + Number(v || 0).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2})
}

// render
function render(){
  const contas = loadContas()
  const filter = filterStatus.value
  const q = (searchInput.value || "").toLowerCase()
  const shown = contas.filter(c=>{
    if(filter === "pending" && c.status !== "pending") return false
    if(filter === "paid" && c.status !== "paid") return false
    if(q && !(c.title || "").toLowerCase().includes(q)) return false
    return true
  })
  listEl.innerHTML = ""
  shown.forEach(c=>{
    const el = document.createElement("div")
    el.className = "item " + (c.status === "paid" ? "paid" : "")
    el.innerHTML = `
      <div class="meta">
        <strong>${escapeHtml(c.title)}</strong>
        <small>${c.due_date ? c.due_date : ""} • ${formatBRL(c.amount)}</small>
      </div>
      <div>
        <button onclick="togglePaid(${c.id})">${c.status === "pending" ? "Pagar" : "Reabrir"}</button>
        <button onclick="edit(${c.id})">Editar</button>
      </div>`
    listEl.appendChild(el)
  })

  saldoEl.innerText = saldoHidden ? "••••••" : formatBRL(calcularSaldo())
  initialInput.type = initialHidden ? "password" : "number"
}

// helpers
function escapeHtml(s=''){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

// ações
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
  const title = f_desc.value.trim()
  const amount = parseFloat(f_val.value || "0")
  const due_date = f_date.value || null
  let contas = loadContas()
  if(editingId){
    const i = contas.findIndex(x=>x.id===editingId)
    contas[i].title = title; contas[i].amount = amount; contas[i].due_date = due_date
  } else {
    const id = Date.now()
    contas.push({ id, title, amount, due_date, status: "pending" })
  }
  saveContas(contas)
  close()
}
deleteBtn.onclick = ()=>{
  if(!editingId) return
  let contas = loadContas()
  contas = contas.filter(x=>x.id !== editingId)
  saveContas(contas)
  close()
}

// OCR
ocrBtn.onclick = async ()=>{
  const file = fileInput.files[0]
  if(!file) return alert("Selecione uma imagem do cupom.")
  ocrText.textContent = "Processando OCR..."
  try{
    const url = URL.createObjectURL(file)
    const res = await Tesseract.recognize(url, 'por')
    const txt = (res.data && res.data.text) ? res.data.text.trim() : ""
    ocrText.textContent = txt || "Nenhum texto detectado."
    const matches = txt.match(/\d{1,3}(?:[.\d{3}])*,\d{2}/g) || txt.match(/\d+,\d{2}/g) || []
    let value = 0
    if(matches.length){
      const cleaned = matches.map(s => parseFloat(s.replaceAll('.', '').replace(',', '.')))
      value = Math.max(...cleaned)
    }
    const title = txt.split('\n').find(Boolean) || "Cupom"
    const contas = loadContas()
    contas.push({ id: Date.now(), title: title.substr(0,80), amount: Number(value||0), due_date: null, status: "pending" })
    saveContas(contas)
    alert("Cupom processado e conta adicionada.")
  }catch(err){
    console.error(err)
    ocrText.textContent = "Erro durante OCR: " + (err.message || err)
  }
}

// import/export
exportBtn.onclick = ()=>{
  const data = localStorage.getItem(STORAGE_KEY) || "[]"
  const filename = `fluxo-dados-${new Date().toISOString().slice(0,19)}.json`
  const blob = new Blob([data], {type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
importBtn.onclick = ()=> importFile.click()
importFile.onchange = (e)=>{
  const f = e.target.files[0]
  if(!f) return
  const reader = new FileReader()
  reader.onload = ()=>{
    try{
      const parsed = JSON.parse(reader.result)
      if(!Array.isArray(parsed)) throw new Error("Arquivo inválido")
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      render()
      alert("Dados importados com sucesso.")
    }catch(err){ alert("Erro ao importar: "+err.message) }
  }
  reader.readAsText(f)
}

// search/filter
filterStatus.onchange = render
searchInput.oninput = render

// tema
themeToggle.onclick = ()=>{
  document.body.classList.toggle("light")
}

// toggle olhos
saldoEye.onclick = ()=>{
  saldoHidden = !saldoHidden
  render()
  saldoEye.innerHTML = saldoHidden ? eyeClosedSvg : eyeOpenSvg
}
initialEye.onclick = ()=>{
  initialHidden = !initialHidden
  render()
  initialEye.innerHTML = initialHidden ? eyeClosedSvg : eyeOpenSvg
}

const eyeOpenSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>`
const eyeClosedSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.97 10.97 0 0 1 12 20c-7 0-11-8-11-8a21.74 21.74 0 0 1 5.17-6.88M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`

// demo inicial
if(!localStorage.getItem(STORAGE_KEY)){
  const demo = [
    { id: Date.now()+1, title: "Compra supermercado", amount: 120.50, due_date: null, status: "pending" },
    { id: Date.now()+2, title: "Internet", amount: 89.9, due_date: null, status: "paid" }
  ]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
}
render()
