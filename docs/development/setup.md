# Instalação e execução

Requisitos: Node.js 20.9+ (recomendado Node 22) e npm.

```powershell
cd projects/customer
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

Acesse http://localhost:3000.

## OpenAI (opcional)

No `.env.local`, configure `OPENAI_API_KEY` e opcionalmente `OPENAI_MODEL=gpt-4.1-mini`. Sem chave, o gerador local cria uma estrutura inicial editável; revisão e explicação usam análise estática local. Para geração semântica, revisão profunda e correção por IA, a chave é necessária. Reinicie o servidor após editar o arquivo.

## Dados locais

Os dados ficam em `projects/customer/.data/fluig-dev-store.json`. O diretório é ignorado pelo Git. Faça backup. Supabase não é necessário nesta etapa.

## Comandos

- `npm run dev` — desenvolvimento.
- `npm run lint` — ESLint.
- `npm run typecheck` — TypeScript.
- `npm run build` — produção.

## Rotas

- `GET /api/health`
- `POST /api/ai` (generate, review, explain, repair)
- `GET/POST /api/datasets`
- `GET/PATCH/DELETE /api/datasets/:id`
- `POST /api/datasets/:id/duplicate`
- `GET /api/datasets/:id/versions`
- `GET /api/history`
- `POST /api/validate`
