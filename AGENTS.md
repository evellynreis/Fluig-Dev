# Fluig Dev — diretrizes para agentes

Fluig Dev é a plataforma de desenvolvimento TOTVS Fluig. Estas regras valem para qualquer alteração no repositório.

## Idioma e interface

- Textos visíveis ao usuário ficam em português do Brasil.
- Identificadores de código, rotas e nomes de arquivos ficam em inglês.
- Mantenha a identidade visual dark profissional: azul-marinho, roxo discreto e contraste legível.

## Código

- Escreva TypeScript em toda a aplicação.
- Mantenha componentes pequenos e reutilizáveis.
- Separe a interface (`src/components`, `src/app`) da regra de negócio de servidor (`src/server`).
- Não coloque segredos, chaves ou credenciais em código de cliente, em `NEXT_PUBLIC_*` nem em arquivos versionados.
- Valide toda entrada de API antes de usá-la.
- Trate erros de forma explícita. Não engula exceções nem devolva sucesso quando a operação não aconteceu.
- Não faça uma tela parecer funcional se a operação ainda não existe. Informe o estado real.

## Fluig

- Não execute JavaScript de datasets gerados.
- Não invente APIs, objetos ou métodos do Fluig.
- Respeite a versão do TOTVS Fluig configurada para o pedido. Se a versão não estiver definida, peça a versão ou marque o ponto como pendente de confirmação na documentação oficial.
- Diferencie dataset interno, dataset customizado/avançado e integração externa.
- Preserve as regras de negócio informadas pelo usuário.
- Explique dependências e limites de compatibilidade junto do código gerado.

## Integrações desta etapa

- A OpenAI é opcional e deve ser chamada somente no servidor. A persistência padrão é JSON local; não introduza Supabase para o cenário local de um único usuário.
- Não preencha exemplos de ambiente com credenciais fictícias.
- Autenticação não faz parte da estrutura inicial.
