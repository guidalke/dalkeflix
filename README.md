# Dalkeflix

Aplicativo React Native para cadastrar e organizar filmes. O projeto demonstra o CRUD completo com uma API REST em Express e banco MySQL, seguindo o estilo simples do AppJogos.

## Estrutura do projeto

- `src/app/`: telas do aplicativo. O Expo Router escolhe a tela pelo nome do arquivo.
- `src/api.js`: endereço e função `fetch` usada pelas telas para chamar o backend.
- `backend/server.js`: inicia a API Express na porta 3000.
- `backend/routes/filmesRoutes.js`: relaciona cada endereço e método HTTP com sua função.
- `backend/controllers/filmesController.js`: valida os dados e executa as consultas SQL.
- `backend/database/conexao.js`: configura o pool de conexões MySQL.
- `database/catalogo_filmes.sql`: cria o banco e a tabela `filmes`.
- `database/migracao_trailer_favoritos.sql`: adiciona trailer e favorito a uma tabela criada pela versão anterior do app. Execute uma única vez se seu banco já existia.

## Banco de dados

Execute `database/catalogo_filmes.sql` no MySQL Workbench. A configuração padrão segue o AppJogos: host `localhost`, usuário `root`, senha `admin` e porta `3307`. Se seu MySQL usar valores diferentes, defina `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` e `DB_NAME` no ambiente antes de iniciar a API.

A tabela armazena título, gênero, ano, avaliação, descrição, link opcional do trailer e indicação de favorito. O MySQL gera o `id` automaticamente. Para um banco novo, basta executar `catalogo_filmes.sql`; para atualizar uma cópia antiga do banco, execute a migração uma única vez. A migração já foi aplicada no MySQL local usado neste projeto: não a execute outra vez nesse banco.

## Iniciar a API

Em um terminal:

```powershell
cd backend
npm install
npm start
```

A API escuta na porta 3000. Deixe esse terminal aberto enquanto usa o aplicativo.

## Iniciar o aplicativo

Em outro terminal, na pasta `findfilm`:

```powershell
npm install
npx expo start
```

No computador, `http://localhost:3000` é o endereço padrão da API. Para um celular físico, crie `.env` na raiz com `EXPO_PUBLIC_API_URL=http://IP_DO_COMPUTADOR:3000`, substituindo pelo IP local do computador, e reinicie o Expo. Celular e computador devem estar na mesma rede. No emulador Android, use `http://10.0.2.2:3000`.

## Como demonstrar o CRUD

1. Abra **Catálogo** para demonstrar o Read: a tela faz `GET /filmes` e mostra os registros salvos.
2. Toque em **Adicionar filme**, preencha os campos e salve para demonstrar Create: o app envia `POST /filmes` com JSON. A mensagem de sucesso aparece; ao voltar ao catálogo, a lista é carregada novamente.
3. Abra um filme e toque em **Editar informações** para demonstrar Update: os campos recebem os dados atuais e o app envia `PUT /filmes/:id` ao salvar.
4. Volte aos detalhes e toque em **Excluir filme**. Confirme a ação para demonstrar Delete: o app envia `DELETE /filmes/:id` e retorna ao catálogo.
5. No catálogo, toque na estrela de até três filmes. Eles aparecem nos cartões da tela inicial. Tentar marcar um quarto filme mostra o limite permitido.
6. No cadastro ou edição, informe opcionalmente um link normal do YouTube, como `https://www.youtube.com/watch?v=...`. A tela de detalhes mostra o trailer no player. Não cole o código `<iframe>`; o app monta o player usando o link.

## Como explicar o fluxo

Quando a tela precisa de dados, ela chama `requisicao` em `src/api.js`. Essa função usa `fetch` e devolve a resposta da API. O Express encontra a rota em `filmesRoutes.js`, chama a função correspondente em `filmesController.js` e o controller consulta o MySQL usando `conexao.js`. O resultado volta como JSON para atualizar a tela.

Os métodos HTTP indicam a ação: GET consulta, POST cadastra, PUT altera dados ou favorito e DELETE exclui. A rota `PUT /filmes/:id/favorito` também confere no backend o limite de três favoritos. No controller, os valores são enviados ao MySQL com parâmetros `?`; isso separa os dados do texto SQL.

## Arquivos para apresentar

- `src/app/catalogo.js`: `carregarFilmes` consulta e atualiza a lista. O `useFocusEffect` carrega de novo quando o catálogo recebe foco.
- `src/app/cadastrar.js`: `cadastrarFilme` verifica os campos, prepara o JSON e envia o POST.
- `src/app/editar.js`: carrega um filme pelo id e envia suas mudanças pelo PUT.
- `src/app/detalhes.js`: consulta um registro pelo id e pede confirmação antes de enviar DELETE.
- `src/app/index.js`: carrega os favoritos do banco e mostra até três cartões na tela inicial.
- `src/app/detalhes.js`: converte o link do YouTube em um endereço de player e reproduz o trailer.
- `backend/controllers/filmesController.js`: valida os dados e executa as consultas SQL.

Para a apresentação, explique cada trecho com suas palavras e mostre a sequência acontecendo no aplicativo. O tema escolhido é uma coleção pessoal de filmes; capas online, login e recursos extras foram deixados de fora para manter o CRUD fácil de demonstrar e entender.
