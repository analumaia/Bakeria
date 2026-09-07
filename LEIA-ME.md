# Bakeria Confeitaria Artesanal — Site de Delivery

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
