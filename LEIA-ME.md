# Cardápio Delivery — Guia rápido

## Estrutura de arquivos
```
delivery-site/
├── index.html          → página inicial (cabeçalho, banner, categorias, produtos)
├── produto.html         → página de detalhe de um produto (galeria, ingredientes)
├── css/style.css        → toda a aparência do site (cores, fontes, layout)
├── js/data.js            → ⭐ ARQUIVO QUE VOCÊ VAI EDITAR NO DIA A DIA
├── js/cart.js            → lógica do carrinho e do link do WhatsApp (não precisa mexer)
├── js/main.js            → renderiza banner e produtos na página inicial (não precisa mexer)
├── js/produto.js         → renderiza a página de detalhe do produto (não precisa mexer)
└── assets/               → pasta para você colocar logo, fotos do banner e dos produtos
```

## O que falta você adicionar
1. ~~Logo~~ ✅ já aplicada (`assets/logo.png`). O arquivo original tinha fundo
   branco sólido; eu removi o fundo e deixei transparente para combinar com o
   cabeçalho bege. Se quiser trocar por outra versão da logo no futuro, é só
   substituir esse arquivo (mantendo fundo transparente, formato PNG).
2. **Fotos dos produtos e dos banners**: salve dentro de `assets/produtos/` e
   `assets/` seguindo os nomes já referenciados em `js/data.js`, ou troque os
   caminhos em `data.js` pelos nomes reais dos seus arquivos.
3. **Confirmar a fonte de corpo**: usei **Poppins** do Google Fonts, pois "Popping"
   não existe como fonte pública. Se você quis dizer outra fonte, me diga o nome
   exato que eu troco em `css/style.css` (linha do `@import`).

## Sobre o nome da marca
A logo que você enviou identifica a loja como **"Bakeria — Confeitaria Artesanal"**.
Troquei todas as referências de texto que antes usavam o placeholder "Cookie & Cia"
(título das abas do navegador e rodapé) para "Bakeria Confeitaria Artesanal", para
ficar consistente com a logo real. Se o nome oficial for outro, me avise onde ajustar.

## Como editar o cardápio (o dia a dia)
Abra `js/data.js`. Lá tem três blocos:
- `CATEGORIAS` — nomes e subtítulos das 4 categorias (não recomendo mudar os `id`).
- `BANNERS` — um ou mais banners de promoção. Adicionar mais de um faz o site
  alternar entre eles automaticamente a cada 6 segundos.
- `PRODUTOS` — cada produto é um bloco `{ ... }`. Para adicionar um novo produto,
  copie um bloco existente, mude o `id` para um número livre, e preencha os campos.

Não precisa saber programar para isso: é só copiar, colar e trocar o texto.

## Como funciona o pedido pelo WhatsApp
Quando o cliente clica em "Fazer pedido pelo WhatsApp", o site monta uma mensagem
como:

```
Olá, gostaria de pedir:
- 2x Cookie Tradicional Chocolate (R$ 19,80)
- 1x Cookie Pie Doce de Leite (R$ 24,90)

Total: R$ 44,70

Nome: Maria
```

e abre `https://wa.me/5538997248270?text=...` com essa mensagem já preenchida.
O número está definido em `js/cart.js`, na constante `WHATSAPP_NUMERO`
(troque lá se o número mudar).

## Como testar localmente
Basta abrir `index.html` no navegador. Como o site usa `fetch`/módulos simples
(não usa `import`/`fetch` de arquivos), funciona até abrindo o arquivo direto
(duplo clique), mas o ideal é usar um servidor local simples, por exemplo:
```
npx serve .
```
ou a extensão "Live Server" do VS Code.

## Como publicar
É um site 100% estático (HTML/CSS/JS puro, sem backend). Você pode subir a pasta
inteira em qualquer hospedagem de arquivos estáticos: Netlify, Vercel, GitHub Pages,
Hostinger, cPanel, etc. Basta que `index.html` fique na raiz do domínio.

## O que já está pronto (checklist do pedido original)
- [x] Cabeçalho com logo (placeholder em texto — falta o arquivo real)
- [x] Banner de promoção editável e com rotação automática
- [x] Produtos organizados em 4 categorias, editáveis via `data.js`
- [x] Clique no produto abre página própria com descrição, ingredientes e galeria
- [x] Adicionar ao carrinho tanto na página inicial quanto na página de produto
- [x] Carrinho fixo no cabeçalho, acessível de qualquer página, com nome do cliente
- [x] Botão de pedido gera link do WhatsApp com o texto do pedido
- [x] Paleta em bege, marrom escuro (texto/títulos), rosa e marrom claro (detalhes)
- [x] Fontes Erica One (títulos) e Poppins (corpo)

## Se eu precisar continuar depois com mais tokens
Todo o código está comentado e organizado por arquivo — qualquer conversa nova
comigo pode partir direto deste pacote de arquivos. Pontos que você pode me pedir
para evoluir depois, se quiser:
- Painel administrativo visual para editar produtos sem mexer em código
- Cálculo de frete / múltiplas formas de entrega
- Botão de favoritos ou "mais pedidos"
- Animações mais elaboradas na troca de categoria
