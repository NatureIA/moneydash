// script.js - consome API dinamicamente
const API_URL = (window.__ENV__ && window.__ENV__.VITE_API_URL) || "http://localhost:8000"

async function listarContas() {
  try {
    const res = await fetch(`${API_URL}/api/payables`)
    const data = await res.json()
    document.getElementById("app").innerHTML =
      "<h2>Contas</h2><pre>" + JSON.stringify(data, null, 2) + "</pre>"
  } catch (err) {
    console.error("Erro ao listar contas", err)
  }
}

window.onload = listarContas
