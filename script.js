// >>>>>> ALTERE PARA A URL DO SEU BACKEND <<<<<<
const BACKEND_BASE = "https://SEU_BACKEND_AQUI"  

async function apiGet(path){
  const res = await fetch(`${BACKEND_BASE}${path}`)
  if(!res.ok) throw new Error(await res.text())
  return res.json()
}
async function apiPost(path, body){
  const res = await fetch(`${BACKEND_BASE}${path}`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  })
  if(!res.ok) throw new Error(await res.text())
  return res.json()
}

// SALDO
async function refreshBalance(){
  document.getElementById('balance').innerText = 'Carregando...'
  try{
    const data = await apiGet('/api/bank/balance')
    document.getElementById('balance').innerText = data.available !== undefined
      ? `R$ ${Number(data.available).toLocaleString('pt-BR',{minimumFractionDigits:2})}`
      : JSON.stringify(data)
  }catch(e){ document.getElementById('balance').innerText = 'Erro: '+e.message }
}

// CONTAS
async function listPayables(){
  const arr = await apiGet('/api/payables')
  const el = document.getElementById('payables')
  el.innerHTML = ''
  arr.forEach(p=>{
    const div = document.createElement('div'); div.className='item'
    div.innerHTML = `${p.title} — R$${p.amount.toFixed(2)} <button onclick="markPaid(${p.id})">${p.status==='paid'?'Desfazer':'Pagar'}</button>`
    el.appendChild(div)
  })
}
async function addPayable(){
  const title = prompt('Título:')
  const amount = parseFloat(prompt('Valor:'))
  if(!title||isNaN(amount)) return
  await apiPost('/api/payables',{title,amount})
  listPayables()
}
async function markPaid(id){
  await apiPost(`/api/payables/${id}`,{status:'paid'})
  listPayables()
}

// OCR
async function uploadReceipt(){
  const input = document.getElementById('receiptFile')
  if(!input.files.length) return alert('Selecione imagem')
  document.getElementById('ocrResult').innerText='Processando...'
  const file=input.files[0]; const url=URL.createObjectURL(file)
  const res=await Tesseract.recognize(url,'por'); const txt=res.data.text||''
  document.getElementById('ocrResult').innerText=txt
  await apiPost('/api/payables',{title:'Cupom',amount:0})
  listPayables()
}

document.getElementById('btn-refresh-balance').onclick=refreshBalance
document.getElementById('btn-list').onclick=listPayables
document.getElementById('btn-add').onclick=addPayable
document.getElementById('btn-upload').onclick=uploadReceipt

refreshBalance(); listPayables()
