# Fluig Dev

Assistente local para desenvolver datasets TOTVS Fluig. A aplicação oferece gerador, editor, gerador de constraints, validador estático, revisão/explicação, biblioteca, versões e histórico.

## Banco de dados

Supabase não é necessário para o cenário atual: uso local por uma pessoa, sem login e sem sincronização. A persistência usa JSON em `projects/customer/.data/fluig-dev-store.json`. Faça backup desse arquivo. Supabase pode ser considerado futuramente para multiusuário, nuvem ou sincronização.

## Executar

```powershell
cd projects/customer
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

Acesse http://localhost:3000. Para recursos inteligentes, configure `OPENAI_API_KEY` em `.env.local`. Sem chave, a geração local cria um esqueleto editável e a análise estática continua disponível.

## Documentação

- `docs/architecture/overview.md`
- `docs/development/setup.md`
- `docs/fluig/datasets.md`
- `AGENTS.md`

## Limitações

O Fluig Dev não se conecta ao servidor Fluig e não executa datasets. A validação é estática e não comprova compatibilidade do runtime. REST/JDBC dependem de contratos e APIs confirmadas na versão do Fluig instalada.
