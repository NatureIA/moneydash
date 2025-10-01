// Banco simulado no navegador
function getContas() {
  return JSON.parse(localStorage.getItem("contas") || "[]")
}

function salvarContas(contas) {
  localStorage.setItem("contas", JSON.stringify(contas))
  atualizarTela()
}

function calcularSaldo() {
  const contas = getContas()
  let saldoInicial = 1000
  let gastos = contas.filter(c => c.status === "pendente").reduce((s, c) => s + c.valor, 0)
  return saldoInicial - gastos
}

function atualizarTela() {
  document.getElementById("saldo").innerText = "R$ " + calcularSaldo().toFixed(2)

  const contas = getContas()
  const div = document.getElementById("contas")
  div.innerHTML = ""
  contas.forEach((c, i) => {
    const el = document.createElement("div")
    el.className = "conta " + (c.status === "pago" ? "pago" : "")
    el.innerHTML = `
      <span>${c.descricao} - R$ ${c.valor.toFixed(2)}</span>
      <button onclick="marcarPago(${i})">${c.status === "pendente" ? "Pagar" : "Reabrir"}</button>
    `
    div.appendChild(el)
  })
}

function novaConta() {
  const descricao = prompt("Descrição da conta:")
  const valor = parseFloat(prompt("Valor (R$):"))
  if (!descricao || isNaN(valor)) return
  const contas = getContas()
  contas.push({ descricao, valor, status: "pendente" })
  salvarContas(contas)
}

function marcarPago(i) {
  const contas = getContas()
  contas[i].status = contas[i].status === "pendente" ? "pago" : "pendente"
  salvarContas(contas)
}

async function enviarCupom() {
  const input = document.getElementById("cupomInput")
  if (!input.files.length) return alert("Selecione uma imagem!")

  const file = input.files[0]
  const image = URL.createObjectURL(file)

  document.getElementById("ocrResultado").innerText = "Lendo cupom..."
  const result = await Tesseract.recognize(image, "por")

  const texto = result.data.text.trim()
  document.getElementById("ocrResultado").innerText = "Cupom lido: " + texto

  // Pega primeira linha como descrição e valor fixo
  if (texto) {
    const descricao = texto.split("\n")[0]
    const contas = getContas()
    contas.push({ descricao, valor: 10.0, status: "pendente" })
    salvarContas(contas)
  }
}

window.onload = atualizarTela
