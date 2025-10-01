// server.cjs - servidor Node simples para Render
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const port = process.env.PORT || 3000
const apiHost = process.env.API_HOST || 'localhost:8000'
const apiScheme = process.env.API_SCHEME || 'https'
const API_ORIGIN = `${apiScheme}://${apiHost}`

const server = http.createServer((req, res) => {
  if (req.url === '/env.js') {
    const payload = `window.__ENV__ = { VITE_API_URL: ${JSON.stringify(API_ORIGIN)} };`
    res.writeHead(200, { 'Content-Type': 'application/javascript' })
    res.end(payload)
    return
  }

  let filePath = path.join(process.cwd(), req.url === '/' ? 'index.html' : req.url)
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404); res.end('Not Found')
    } else {
      res.writeHead(200); res.end(content)
    }
  })
})

server.listen(port, () => {
  console.log(`Site rodando na porta ${port} | API em ${API_ORIGIN}`)
})
