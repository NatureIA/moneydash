const STORAGE_KEY="fluxo:contas",BAL_KEY="fluxo:saldo_inicial"
const listEl=document.getElementById("list"),saldoEl=document.getElementById("saldo")
const initialInput=document.getElementById("initialBalance"),saveInitialBtn=document.getElementById("saveInitial")
const toggleSaldoBtn=document.getElementById("toggleSaldo"),eyeIcon=document.getElementById("eyeIcon")
const toggleInitialBtn=document.getElementById("toggleInitial"),eyeIconInitial=document.getElementById("eyeIconInitial")
const themeToggle=document.getElementById("themeToggle"),themeIcon=document.getElementById("themeIcon")

let saldoHidden=false,initialHidden=false

function load(){return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}
function save(d){localStorage.setItem(STORAGE_KEY,JSON.stringify(d));render()}
function getInit(){return parseFloat(localStorage.getItem(BAL_KEY)||"0")}
function setInit(v){localStorage.setItem(BAL_KEY,String(v));render()}
function calcSaldo(){return getInit()-load().filter(c=>c.status==="paid").reduce((s,c)=>s+Number(c.amount||0),0)}
function fmt(v){return "R$ "+Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}

function render(){
  saldoEl.textContent=saldoHidden?"•••••":fmt(calcSaldo())
  initialInput.type=initialHidden?"password":"number"
  const contas=load();listEl.innerHTML=""
  contas.forEach(c=>{
    const el=document.createElement("div");el.className="item "+(c.status==="paid"?"paid":"")
    el.innerHTML=`<div><strong>${c.title}</strong><br><small>${c.due_date||""} • ${fmt(c.amount)}</small></div>
    <div><button onclick="toggle(${c.id})">${c.status==="pending"?"Pagar":"Reabrir"}</button></div>`
    listEl.appendChild(el)
  })
}

// alternar status
window.toggle=function(id){
  let d=load();let i=d.findIndex(x=>x.id===id);if(i<0)return
  d[i].status=d[i].status==="pending"?"paid":"pending"
  save(d)
}

// saldo inicial
saveInitialBtn.onclick=()=>setInit(parseFloat(initialInput.value||"0"))

// ocultar/mostrar saldo
toggleSaldoBtn.onclick=()=>{
  saldoHidden=!saldoHidden
  eyeIcon.innerHTML=saldoHidden
    ? '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.29 20.29 0 0 1 5.06-6.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a20.29 20.29 0 0 1-3.95 5.95M1 1l22 22"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'
  render()
}
toggleInitialBtn.onclick=()=>{
  initialHidden=!initialHidden
  eyeIconInitial.innerHTML=initialHidden
    ? '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.29 20.29 0 0 1 5.06-6.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a20.29 20.29 0 0 1-3.95 5.95M1 1l22 22"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'
  render()
}

// alternar tema
themeToggle.onclick=()=>{
  document.documentElement.classList.toggle("light")
  const isLight=document.documentElement.classList.contains("light")
  themeIcon.innerHTML=isLight
    ? '<circle cx="12" cy="12" r="5"/>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>'
}

render()
