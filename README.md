# Finance Website — FastAPI + OCR + Banco (Open Finance Stub)

Plataforma **100% web** (site) para:
- Consultar saldo e transações do banco (integração via stub configurável por número do banco, agência e conta).
- Registrar **contas a pagar/pagas**.
- Enviar **fotos de cupons fiscais** → OCR → gerar despesa automaticamente.
- UI moderna (React + Tailwind) servida por **Nginx** (site).

## Subir localmente (Docker)
1. Copie `.env.example` para `.env` e **preencha** `BANK_NUMBER`, `BANK_AGENCY`, `BANK_ACCOUNT`.
2. `docker compose up --build`
3. Website: http://localhost:3000  
   API (docs): http://localhost:8000/docs  
   Fila RQ: http://localhost:9181  
   Login demo: `admin@example.com` / `admin123`

## Deploy
- Faça push para o GitHub.
- Em um servidor com Docker, clone o repo e rode `docker compose up -d --build`.
- Coloque um proxy com TLS (Caddy/Traefik/Nginx) se for expor publicamente.

## Notas
- **Sem PWA**. É um site responsivo moderno (SPA React) — sem service worker.
- Para integração bancária real (Belvo/Open Finance), troque `app/services/bank_provider.py`.
