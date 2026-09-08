# Bakeria Confeitaria Artesanal — Site de Delivery

## Entrega ou Retirada no carrinho
- O carrinho agora começa com o título **"Dados do pedido"** e um seletor
  **Retirada / Entrega** logo abaixo do nome do cliente — **Retirada vem
  marcada por padrão**.
- **Retirada**: mostra o endereço do local para o cliente buscar o pedido.
  ⚠️ **Você precisa editar esse endereço** — abra `data.js`, procure pela
  constante `ENDERECO_RETIRADA` bem no topo do arquivo, e troque
  `"Rua Exemplo, 123 - Bairro Exemplo - Sua Cidade/UF"` pelo endereço real
  da sua loja/cozinha. Nenhum campo de CEP é exigido nesse modo.
- **Entrega**: mostra um aviso de que o frete é calculado à parte e
  combinado pelo WhatsApp, e exibe os campos de **CEP de entrega** (com
  busca automática), Rua, Número, Bairro e Cidade — todos obrigatórios,
  exceto o Número.
- A mensagem enviada ao WhatsApp já indica automaticamente qual foi a
  escolha: se for retirada, inclui o endereço da loja; se for entrega,
  inclui o endereço do cliente.
- A escolha (Entrega/Retirada) fica salva no navegador do cliente, então
  se ele voltar depois já vem pré-selecionada com a última opção usada.

## Correção de bugs no mobile (após teste real no celular)
Ao testar no celular, dois problemas apareceram:
- **Banner desproporcional**: havia duas regras de CSS conflitantes para
  telas pequenas (uma esquecida de uma versão anterior), forçando uma altura
  fixa em pixels que não se adaptava à largura real da tela — o banner
  ficava muito mais alto do que devia, empurrando todo o resto do site pra
  baixo. Corrigido: agora a altura do banner é sempre proporcional à
  largura da tela (usando `aspect-ratio` em vez de altura fixa), então se
  adapta corretamente a qualquer aparelho.
- **Categoria "Promoções" sumindo no celular**: o filtro de categorias
  rolava na horizontal, mas sem nenhuma indicação visual de que dava pra
  arrastar — resultado: "Combos" aparecia cortado na borda e "Promoções"
  ficava completamente escondido fora da tela. Corrigido: os tiles agora
  quebram em linhas (2–3 por linha, dependendo do espaço) em vez de rolar
  para o lado. Todas as categorias ficam sempre visíveis de uma vez,
  sem precisar arrastar nada.

**Se você tiver testado antes desta correção e ainda ver o problema
antigo**: pode ser cache do navegador segurando a versão anterior do
`style.css`. Tente atualizar a página forçando o recarregamento
(no Chrome do Android: menu ⋮ → Configurações → Privacidade → Limpar dados
de navegação, ou simplesmente feche e abra o site de novo depois de alguns
minutos — o GitHub Pages também pode levar um ou dois minutos para propagar
uma atualização).

## Carrinho: CEP com busca automática e endereço obrigatório
- Ao digitar o CEP (8 dígitos), o site busca automaticamente Rua, Bairro e
  Cidade usando a API pública e gratuita **ViaCEP** — não precisa de chave
  nem cadastro, mas precisa de internet no aparelho do cliente.
- O campo **Número** é sempre digitado manualmente (nenhum CEP indica o
  número da casa), e fica disponível mesmo se o CEP não retornar endereço.
- **Nome e CEP (com endereço encontrado) são obrigatórios** para liberar o
  botão "Fazer pedido pelo WhatsApp" — ele fica desabilitado até os dois
  estarem preenchidos corretamente.
- Se o cliente digitar um CEP que não existe, aparece o aviso "CEP não
  encontrado" e o botão continua bloqueado até corrigir.
- O endereço entra automaticamente na mensagem enviada ao WhatsApp, junto
  com o pedido.

## Correções mais recentes
- **Carregamento infinito corrigido**: havia um bug no código que, quando uma
  foto de produto não existia, tentava "limpar" a imagem definindo
  `src=""`. Isso faz o navegador recarregar a própria página como se fosse
  uma imagem, entrando em loop — por isso o site ficava "carregando" para
  sempre. Corrigido: agora, quando falta uma foto, aparece um aviso discreto
  "🍪 Foto em breve" no lugar, sem travar nada.
- **Favicon adicionado**: a mascote que você enviou agora aparece na aba do
  navegador (`favicon.png`) e como ícone ao salvar o site na tela inicial do
  celular (`apple-touch-icon.png`). O fundo branco foi removido automaticamente.
- **Rodapé**: trocado o texto "Bakeria Confeitaria Artesanal" (que ficava
  ilegível) pela logo de verdade, na versão bege (`logo-rodape.png`), que
  contrasta bem com o fundo marrom escuro do rodapé.
- **Aba "Todos"**: não agrupa mais por categoria. Agora mostra uma vitrine
  única, na ordem que você define no array `DESTAQUES` dentro de `data.js`
  — é assim que você destaca um produto específico quando quiser.
- **Responsivo**: ajustes específicos para celular em pé (proporção 9:16) e
  para tablet — grade de produtos em 1 coluna no celular, cabeçalho e banner
  mais compactos, filtro de categorias em lista rolável horizontal.

## ⚠️ Por que o site não estava funcionando no GitHub Pages
No repositório, todos os arquivos ficaram soltos na raiz (sem as pastas `css/`,
`js/` e `assets/`). Como o site procurava por `css/style.css`, `js/data.js` e
`assets/logo.png`, e essas pastas não existiam, nada carregava — por isso a
página aparecia sem estilo, com a logo gigante e sem cores.

**A solução**: refiz o projeto para não usar nenhuma subpasta. Agora é tudo
solto, exatamente como já estava aparecendo no seu repositório. Assim, seja
qual for a forma que você usar para subir os arquivos, vai funcionar.

## Estrutura de arquivos (tudo na raiz, sem pastas)
```
index.html       → página inicial
produto.html      → página de detalhe do produto
style.css         → toda a aparência do site
data.js           → ⭐ ARQUIVO QUE VOCÊ EDITA NO DIA A DIA (produtos e banners)
cart.js           → lógica do carrinho e WhatsApp (não precisa mexer)
main.js           → renderiza banner e produtos na home (não precisa mexer)
produto.js        → renderiza a página de um produto (não precisa mexer)
logo.png          → sua logo (fundo já removido)
[fotos de produtos e banners vão aqui também, soltas na raiz]
```

## Como subir para o GitHub corretamente
1. Entre no seu repositório no GitHub.
2. Clique em **Add file → Upload files**.
3. Arraste **todos os arquivos deste pacote de uma vez só** (index.html,
   produto.html, style.css, data.js, cart.js, main.js, produto.js, logo.png,
   LEIA-ME.md e as fotos que você for adicionar) direto para a área de upload.
4. Role para baixo e clique em **Commit changes**.
5. Espere 1–2 minutos e acesse o link do GitHub Pages novamente
   (Settings → Pages, ou o link que já estava usando).

**Importante**: não crie pastas manualmente no GitHub para esses arquivos.
Deixe tudo solto na raiz do repositório (ou dentro da pasta `docs/`, se for
essa a configuração do seu GitHub Pages — mas mantenha tudo no mesmo nível,
sem `css/`, `js/` ou `assets/` dentro dela).

## Fotos que ainda faltam
Salve as fotos com exatamente estes nomes, soltas na raiz do repositório
(sem pasta), pois é assim que `data.js` está referenciando:
- tradicional-1.jpg
- cookie-tradicional-1.jpg / cookie-tradicional-2.jpg
- cookie-nozes-1.jpg
- cookie-pie-avela-1.jpg / cookie-pie-avela-2.jpg / cookie-pie-avela-3.jpg
- cookie-pie-docedeleite-1.jpg
- cookie-pie-nutella-1.jpg
- cookie-pie-kinderbueno-1.jpg
- cookie-pie-ninhonutella-1.jpg
- cookie-pie-brigadeiro-1.jpg
- combo-dupla-1.jpg
- combo-cookiepie-1.jpg
- combo-doiscookies-1.jpg
- promo-leve6-1.jpg
- banner-1.jpg
- banner-2.jpg

Se preferir usar nomes diferentes, é só ajustar o campo `imagens` (produtos)
ou `imagem` (banners) dentro de `data.js`.

## Como editar o cardápio (o dia a dia)
Abra `data.js`. Lá tem três blocos:
- `CATEGORIAS` — nomes e subtítulos das 4 categorias.
- `BANNERS` — um ou mais banners de promoção (alternam automaticamente a cada
  6 segundos se houver mais de um).
- `PRODUTOS` — cada produto é um bloco `{ ... }`. Para adicionar um produto
  novo, copie um bloco existente, troque o `id` por um número livre e
  preencha os campos.

Não precisa saber programar: é copiar, colar e trocar o texto/número.

## Como funciona o pedido pelo WhatsApp
Ao clicar em "Fazer pedido pelo WhatsApp", o site monta uma mensagem como:
```
Olá, gostaria de pedir:
- 2x Cookie Tradicional Chocolate (R$ 19,80)
- 1x Cookie Pie Doce de Leite (R$ 24,90)

Total: R$ 44,70

Nome: Maria
```
e abre `https://wa.me/5538997248270?text=...` já com essa mensagem preenchida.
O número está em `cart.js`, na constante `WHATSAPP_NUMERO`.

## Checklist do que já está pronto
- [x] Cabeçalho com a logo real (Bakeria Confeitaria Artesanal)
- [x] Banner de promoção editável, com rotação automática
- [x] Produtos organizados em 4 categorias, editáveis via `data.js`
- [x] Clique no produto abre página própria com descrição, ingredientes e galeria
- [x] Adicionar ao carrinho tanto na página inicial quanto na página de produto
- [x] Carrinho fixo no cabeçalho, acessível de qualquer página, com nome do cliente
- [x] Botão de pedido gera link do WhatsApp com o texto do pedido
- [x] Paleta em bege, marrom escuro (texto/títulos), rosa e marrom claro (detalhes)
- [x] Fontes Erica One (títulos) e Poppins (corpo)
- [ ] Fotos dos produtos e banners (você ainda precisa adicionar)
