const STORAGE_KEY = "fluxo:contas:v2"
const BAL_KEY = "fluxo:saldo_inicial:v2"

const listEl = document.getElementById("list")
const saldoEl = document.getElementById("saldo")
const initialInput = document.getElementById("initialBalance")
const saveInitialBtn = document.getElementById("saveInitial")
const filterStatus = document.getElementById("filterStatus")
const searchInput = document.getElementById("search")
const fileInput = document.getElementById("fileInput")
const ocrBtn = document.getElementById("ocrBtn")
const ocrText = document.getElementById("ocrText")

const quickForm = document.getElementById("quickForm")
const q_desc = document.getElementById("q_desc")
const q_val = document.getElementById("q_val")
const q_date = document.getElementById("q_date")

function loadContas(){ return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]") }
function saveContas(a){ localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); render() }
function getInitial(){ return parseFloat(localStorage.getItem(BAL_KEY)||"0") }
function setInitial(v){ localStorage.setItem(BAL_KEY, String(v)); render() }
initialInput.value = getInitial()
saveInitialBtn.onclick = ()=> setInitial(parseFloat(initialInput.value||"0"))

function calcularSaldo(){
  const contas = loadContas()
  const pend = contas.filter(c=>c.status==="pending")
  const gastos = pend.reduce((s,c)=>s+Number(c.amount||0),0)
  return getInitial()-gastos
}
function formatBRL(v){ return "R$ "+Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2}) }

function render(){
  const contas = loadContas()
  const f = filterStatus.value, q=(searchInput.value||"").toLowerCase()
  const shown = contas.filter(c=>{
    if(f==="pending"&&c.status!=="pending")return false
    if(f==="paid"&&c.status!=="paid")return false
    if(q&&!c.title.toLowerCase().includes(q))return false
    return true
  })
  listEl.innerHTML=""
  shown.forEach(c=>{
    const el=document.createElement("div")
    el.className="item "+(c.status==="paid"?"paid":"")
    el.innerHTML=`<div><b>${c.title}</b> • ${c.due_date||""} • ${formatBRL(c.amount)}</div>
    <div>
      <button onclick="togglePaid(${c.id})">${c.status==="pending"?"Pagar":"Reabrir"}</button>
      <button onclick="del(${c.id})">Excluir</button>
    </div>`
    listEl.appendChild(el)
  })
  saldoEl.innerText=formatBRL(calcularSaldo())
}
window.togglePaid=id=>{
  const contas=loadContas()
  const i=contas.findIndex(x=>x.id===id)
  contas[i].status=contas[i].status==="pending"?"paid":"pending"
  saveContas(contas)
}
window.del=id=>{
  let contas=loadContas().filter(c=>c.id!==id)
  saveContas(contas)
}

quickForm.onsubmit=e=>{
  e.preventDefault()
  const contas=loadContas()
  contas.push({id:Date.now(),title:q_desc.value,amount:parseFloat(q_val.value),due_date:q_date.value||null,status:"pending"})
  saveContas(contas)
  quickForm.reset()
}

// OCR
ocrBtn.onclick=async()=>{
  const f=fileInput.files[0]; if(!f) return alert("Selecione uma imagem")
  ocrText.textContent="Processando..."
  const url=URL.createObjectURL(f)
  const res=await Tesseract.recognize(url,'por')
  const txt=res.data.text
  ocrText.textContent=txt||"Nenhum texto"
  const match=txt.match(/\d+,\d{2}/)
  const value=match?parseFloat(match[0].replace(',','.')):0
  const contas=loadContas()
  contas.push({id:Date.now(),title:"Cupom",amount:value,status:"pending"})
  saveContas(contas)
}

// init demo
if(!localStorage.getItem(STORAGE_KEY)){
  saveContas([{id:1,title:"Internet",amount:90,status:"pending"}])
}
render()
filterStatus.onchange=render
searchInput.oninput=render
