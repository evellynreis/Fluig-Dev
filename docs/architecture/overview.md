# Arquitetura do Fluig Dev

A aplicação é um Next.js 16 local para um único desenvolvedor. A interface e os Route Handlers ficam em `projects/customer/src/app`; os componentes em `components`; regras e integrações em `server`; utilitários em `lib`; tipos em `types`.

## Persistência: sem Supabase nesta fase

Supabase não é necessário para uso local, individual, sem autenticação ou sincronização entre dispositivos. O sistema grava datasets, versões e histórico em `.data/fluig-dev-store.json`, usando gravações serializadas e arquivo temporário seguido de rename. Faça backup dessa pasta.

Considere Supabase/PostgreSQL somente quando houver multiusuário, hospedagem centralizada, sincronização entre computadores ou controle de acesso.

## Fluxos

- Geração: formulário → `POST /api/ai` → modelo local ou OpenAI Responses API → análise estática → Monaco Editor.
- Persistência: `POST/GET/PATCH/DELETE /api/datasets` → JSON local.
- Validação: `POST /api/validate` → Acorn ES5 + regras heurísticas, sem executar JavaScript.
- Histórico: operações são registradas no arquivo local.

A chave OpenAI fica exclusivamente no servidor. O código gerado nunca é executado pela aplicação.
