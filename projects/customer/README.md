# Fluig Dev

Aplicação local para criar, analisar, validar e organizar datasets JavaScript do TOTVS Fluig.

## Banco de dados: Supabase é necessário?

**Não.** Para o cenário atual (uso local, um desenvolvedor, sem login e sem sincronização entre máquinas), Supabase adicionaria configuração e operação desnecessárias. O Fluig Dev utiliza persistência local em JSON, armazenada em `projects/customer/.data/fluig-dev-store.json`. Os dados continuam disponíveis após reiniciar o Next.js. Faça backup periódico dessa pasta.

O Supabase poderá ser adicionado futuramente se houver necessidade de acesso por vários usuários, sincronização entre computadores, hospedagem centralizada ou permissões multiusuário.

## Executar

Requisitos: Node.js 20.9+ (recomendado Node 22 LTS) e npm.

```bash
cd projects/customer
npm install
copy .env.local.example .env.local
npm run dev
```

Abra http://localhost:3000. Sem `OPENAI_API_KEY`, a geração local cria um esqueleto funcional/editável e explica os TODOs. Para geração, revisão semântica e correção por IA, preencha `OPENAI_API_KEY` em `.env.local` e reinicie o servidor.

## Funcionalidades

- Gerador de dataset com modelo local e integração OpenAI opcional.
- Monaco Editor, copiar e baixar JavaScript.
- Gerador de constraints MUST, SHOULD e MUST_NOT.
- Validação estática ES5 sem executar o código.
- Revisão e explicação local; análise semântica via OpenAI quando configurada.
- Biblioteca com CRUD, duplicação, versões e download.
- Histórico de gerações e validações.
- Dashboard com estatísticas reais.

## Limitações importantes

O Fluig Dev não possui conexão com o servidor Fluig e não executa datasets. O código gerado é uma base para revisão, não uma garantia de compatibilidade. REST e SQL exigem dados técnicos e mecanismos autorizados para a versão instalada; o gerador marca esses trechos com TODO em vez de inventar integrações.
