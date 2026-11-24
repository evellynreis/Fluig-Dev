# Datasets no TOTVS Fluig

Este texto resume o que a documentação pública da TOTVS descreve e separa o que precisa ser confirmado na versão instalada. O Fluig Dev ainda não tem uma versão alvo configurada. Nenhum exemplo daqui deve ser tratado como válido para todas as atualizações.

Fontes consultadas:

- [Acessando Datasets](https://tdn.totvs.com/display/public/fluig/Acessando+Datasets), TDN Fluig, atualizada em 13 de agosto de 2026.
- [Guia de Referência para Customização de Datasets](https://tdn.totvs.com/pages/viewpage.action?pageId=268583266), TDN. Esse guia descreve o modelo do TOTVS ECM e não substitui a documentação da Fluig Plataforma.
- [Construção do Dataset Avançado](https://tdn.totvs.com/pages/viewpage.action?pageId=412888219), TDN.
- [Não é possível transformar um Dataset em Offline](https://centraldeatendimento.totvs.com/hc/pt-br/articles/27662372543255), Central de Atendimento TOTVS.

## Conceitos

Um dataset é a forma padronizada de consultar dados no Fluig, independente da origem. Quem consome o dataset enxerga colunas e linhas. A origem pode mudar sem alterar o consumidor, desde que os nomes dos campos permaneçam.

Há três usos que este projeto precisa distinguir:

- **Dataset interno.** Entregue pela plataforma ou por uma definição de formulário. A plataforma aplica constraints, ordenação e parte das constraints especiais.
- **Dataset customizado ou avançado.** JavaScript cadastrado no produto. O desenvolvedor monta as colunas e as linhas. A plataforma não aplica sozinha as constraints de um dataset interno; o filtro precisa estar escrito no próprio script, se a regra de negócio exigir.
- **Integração.** O dataset customizado busca dados fora do Fluig, por exemplo em serviço ou banco externo. O cliente HTTP, SOAP ou JDBC depende da versão e não está fixado neste documento.

O guia antigo do ECM divide a origem em built-in, fichário e dataset customizado. Na Fluig Plataforma, formulários e datasets avançados ocupam esses papéis. Confirme os nomes usados no ambiente antes de documentar um dataset para o cliente.

## Estrutura de um dataset customizado

A construção documentada no TDN usa `createDataset(fields, constraints, sortFields)` e devolve um dataset criado com `DatasetBuilder.newDataset()`.

```javascript
function createDataset(fields, constraints, sortFields) {
  var dataset = DatasetBuilder.newDataset();
  dataset.addColumn("SIGLA");
  dataset.addColumn("ESTADO");
  dataset.addRow(["AM", "Amazonas"]);
  return dataset;
}
```

`fields` e `sortFields` são arrays de string. `constraints` é um array de constraints. Ignorar esses parâmetros faz o filtro pedido pelo consumidor não acontecer. Isso é regra de implementação, não um comportamento automático da plataforma para dataset avançado.

Métodos de navegação citados na documentação de acesso:

- `rowsCount`
- `getValue(indice, nomeDaColuna)`

No formulário, o dataset consultado pela biblioteca cliente chega ao navegador. A página oficial pede para incluir `/webdesk/vcXMLRPC.js` antes do uso de `DatasetFactory` no HTML. O volume de dados importa, porque a consulta sai do servidor e vai para o browser.

## DatasetFactory

No servidor, em eventos, widgets no modelo clássico e outros datasets, o acesso documentado é:

```javascript
var dataset = DatasetFactory.getDataset("group", null, null, null);
```

A assinatura de `getDataset` é:

1. nome do dataset;
2. campos que devem voltar, ou `null` para todos;
3. array de constraints, ou `null` para não filtrar;
4. array de campos de ordenação, ou `null` para a ordem padrão.

A constraint é criada com:

```javascript
DatasetFactory.createConstraint(campo, valorInicial, valorFinal, ConstraintType.MUST);
```

No servidor, uma busca do tipo LIKE usa o método `setLikeSearch(true)` na constraint já criada. Com a biblioteca `vcXMLRPC.js`, a própria página da TOTVS diz para não usar `setLikeSearch` e sim um quinto parâmetro booleano em `createConstraint`. Esse quinto argumento vale apenas para `vcXMLRPC.js`.

## DatasetBuilder

`DatasetBuilder.newDataset()` cria o dataset vazio do script customizado. No objeto retornado, a documentação mostra:

- `addColumn(nome)`
- `addRow(arrayDeValores)`

Não há, nas páginas consultadas, um método `DatasetBuilder.create(...)`. Não use variações que não estejam na documentação da versão alvo.

A mesma página de acesso descreve uma pesquisa mais nova:

```javascript
var registros = datasets.get("document").search({});
```

O objeto `datasets.get(nome).search(filtros)` devolve JSON, não o dataset clássico. Os filtros documentados incluem `value`, `not`, `like`, `between`, `limit`, `offset` e `order`. A página também mostra um array simples no campo como forma de SHOULD e avisa que, naquele momento, SHOULD só pode ser usado uma vez.

O texto oficial alterna "objeto datasets" e "método get do objeto dataset". A versão mínima dessa pesquisa não está declarada na página consultada. Confirme na atualização instalada antes de gerar código que use `datasets.get`.

## Constraints

`ConstraintType` documentado:

| Tipo | Efeito descrito pela TOTVS |
| --- | --- |
| `MUST` | O registro precisa atender à condição. |
| `SHOULD` | O registro pode atender à condição. É o caminho usual para "valor A ou valor B" no mesmo campo. |
| `MUST_NOT` | O registro não pode atender à condição. |

Constraints especiais documentadas para datasets internos e, no caso indicado, para formulários:

- `sqlLimit`: limita a consulta SQL. Só o `initialValue` é considerado. O retorno ainda pode ser menor por causa de validações posteriores, como ficha ativa e permissão.
- `onlyMainCards`: usada em dataset de definição de formulário. Também considera só o `initialValue`. O padrão informado é `false`, incluindo formulários filhos.
- `checkSecurity`: a partir da atualização 1.8.2, a checagem de segurança dos registros de formulário passa a ser padrão. Em atualizações `2.0.0-260623` e superiores, a TOTVS informa que desligar essa validação com `false` foi descontinuado.

A partir das atualizações 1.6.5 Liquid, 1.7.0 Lake e 1.7.1 Crystal Lake, selects enviados por constraint são bloqueados. A TOTVS encaminha para a documentação "Datasets acessando banco de dados externo". Não monte SQL dentro de constraint.

Para dataset avançado, a plataforma não garante a aplicação dessas constraints. Se o script precisar filtrar, a regra tem de ser implementada com os parâmetros recebidos em `createDataset`.

## Integrações

Um dataset customizado pode representar dados externos, mas o mecanismo muda por versão. Pontos que este documento não fixa, porque a assinatura não foi confirmada aqui:

- cliente HTTP ou serviço autorizado do Fluig;
- chamada SOAP;
- conexão JDBC e o procedimento que substitui o select em constraint.

Enquanto esses pontos não forem conferidos na documentação da versão, a implementação deve declarar a dependência e parar, em vez de escolher um cliente.

Também há diferença entre executar a consulta no servidor e transportá-la ao navegador com `vcXMLRPC.js`. Integração com credencial fica no servidor.

## Compatibilidade de versões

| Comportamento | O que a documentação consultada afirma | Confirmação ainda necessária |
| --- | --- | --- |
| `DatasetFactory.getDataset` e `createConstraint` | Contrato clássico de acesso no servidor. | Conferir se o dataset interno citado existe na versão. Exemplos oficiais usam `group` e `document`; a lista completa não foi copiada para cá. |
| `setLikeSearch` versus quinto argumento | O quinto argumento é específico de `vcXMLRPC.js`. | Conferir qual biblioteca o formulário ou widget realmente carrega. |
| `datasets.get().search()` | Documentado como nova pesquisa, com retorno JSON. | A página não informa a atualização mínima. |
| `checkSecurity` | Padrão desde 1.8.2; `false` descontinuado em `2.0.0-260623` e superiores. | Conferir o número exato da atualização do ambiente. |
| Select em constraint | Bloqueado desde 1.6.5 Liquid, 1.7.0 Lake e 1.7.1 Crystal Lake. | Seguir o guia de banco externo da mesma versão. |
| Dataset offline | O artigo da Central de Atendimento diz que `defineStructure` é obrigatório e que `addColumn`, `setKey` e `addIndex` devem usar nomes em maiúsculas. | Confirmar `onSync` e `onMobileSync` na documentação de dataset offline da versão. As assinaturas não são fixadas aqui. |
| ECM 3.0 | O guia antigo cita `ecm_datasets.js` e outro modelo de constraint no cliente. | Não reutilizar esse modelo na Fluig Plataforma sem conferir a versão. |

Exemplo apenas para a estrutura offline citada pela Central de Atendimento, com nomes em maiúsculas:

```javascript
function defineStructure() {
  addColumn("CODIGO");
  addColumn("DESCRICAO");
  setKey(["CODIGO"]);
  addIndex(["DESCRICAO"]);
}
```

Esse trecho não sincroniza dados. A função que carrega ou atualiza o dataset offline precisa ser tirada da documentação da versão alvo.

## O que não fazer

- Não inventar método, constraint ou dataset interno para completar um exemplo.
- Não executar o JavaScript do dataset dentro do Fluig Dev.
- Não transportar para o navegador uma consulta que dependa de credencial.
- Não apresentar um guia de ECM 3.0 como se fosse o comportamento da Fluig Plataforma atual.
