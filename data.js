/* ============================================================
   DADOS DO SITE — este é o único arquivo que você precisa editar
   no dia a dia para adicionar, remover ou alterar produtos e banners.

   COMO ADICIONAR UM PRODUTO NOVO:
   1. Copie um bloco { ... } inteiro dentro do array PRODUTOS.
   2. Troque o "id" por um número que não exista ainda.
   3. Preencha os campos. "imagens" aceita 1 ou várias fotos.
   4. Salve o arquivo — o site atualiza sozinho.

   CATEGORIAS VÁLIDAS (use exatamente estes textos em "categoria"):
   "tradicionais" | "cookie-pies" | "combos" | "promocoes"
   ============================================================ */

/* ------------------------------------------------------------
   ENDEREÇO DE RETIRADA
   Aparece no carrinho quando o cliente escolhe "Retirada" em vez
   de "Entrega". Troque pelo endereço real da sua loja/cozinha.
------------------------------------------------------------ */
const ENDERECO_RETIRADA = "Rua Exemplo, 123 - Bairro Exemplo - Sua Cidade/UF";

const CATEGORIAS = [
  { id: "tradicionais", nome: "Tradicionais",  subtitulo: "Os clássicos que nunca saem de moda", icone: "🍪" },
  { id: "cookie-pies",  nome: "Cookie Pies",   subtitulo: "Cookie recheado, quentinho e generoso", icone: "🥧" },
  { id: "combos",       nome: "Combos",        subtitulo: "Mais sabor, mais economia", icone: "🎁" },
  { id: "promocoes",    nome: "Promoções",     subtitulo: "Por tempo limitado", icone: "🔥" },
];

/* ------------------------------------------------------------
   BANNERS DE PROMOÇÃO
   Adicione quantos objetos quiser no array — o site alterna
   entre eles automaticamente a cada 6 segundos. Para deixar
   fixo em um só, deixe apenas 1 item no array.
------------------------------------------------------------ */
const BANNERS = [
  {
    tag: "Promoção da semana",
    titulo: "Combo Cookie Pie + Refrigerante",
    texto: "Peça pelo WhatsApp e garanta preço especial até domingo.",
    imagem: "banner-1.jpg",
    linkTexto: "Ver promoções",
    linkCategoria: "promocoes"
  },
  {
    tag: "Novidade",
    titulo: "Cookie Pie Chocotella",
    texto: "Massa crocante por fora, recheio generoso de Nutella por dentro.",
    imagem: "banner-2.jpg",
    linkTexto: "Conferir Cookie Pies",
    linkCategoria: "cookie-pies"
  }
];

/* ------------------------------------------------------------
   PRODUTOS
   - preco: número, use ponto (.) como separador decimal
   - imagens: array de caminhos — a 1ª é usada no card da lista
   - ingredientes: array de textos curtos (aparecem como "tags")
------------------------------------------------------------ */
const PRODUTOS = [
  {
    id: 1,
    nome: "Cookie Tradicional Chocolate",
    categoria: "tradicionais",
    preco: 14.00,
    descricaoCurta: "Cookie crocante por fora, macio por dentro, com gotas de chocolate.",
    descricaoCompleta: "Nosso cookie tradicional é feito com manteiga de verdade e uma generosa quantidade de gotas de chocolate meio amargo. Assado na hora para garantir aquele centro macio e derretido.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Chocolate meio amargo", "Açúcar mascavo", "Ovos", "Baunilha"],
    imagens: ["cookie-tradicional-1.jpg", "cookie-tradicional-2.jpg"]
  },
  {
    id: 2,
    nome: "Cookie Pie Chocotella",
    categoria: "cookie-pies",
    preco: 17.00,
    descricaoCurta: "Cookie em formato de tartelete, servido com muuuuuita Nutella.",
    descricaoCompleta: "Uma torta de cookie individual, com bordas crocantes e centro derretido recheado com creme de chocolate e avelã. Perfeito para comer de colher.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Creme de avelã", "Chocolate ao leite", "Açúcar", "Ovos"],
    imagens: ["cookie-pie-avela-1.jpg", "cookie-pie-avela-2.jpg", "cookie-pie-avela-3.jpg"]
  },
  {
    id: 3,
    nome: "Cookie Pie Kinder Bueno",
    categoria: "cookie-pies",
    preco: 17.00,
    descricaoCurta: "Recheio cremoso com pedaços de Kinder Bueno.",
    descricaoCompleta: "Massa de cookie amanteigada recheada com creme de chocolate e pedaços de Kinder Bueno, para quem ama uma combinação irresistível.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Kinder Bueno", "Chocolate ao leite", "Açúcar mascavo", "Ovos"],
    imagens: ["cookie-pie-kinderbueno-1.jpg"]
  },
  {
    id: 4,
    nome: "Cookie Pie Ninhotella",
    categoria: "cookie-pies",
    preco: 17.00,
    descricaoCurta: "Combinação cremosa de leite Ninho com Nutella.",
    descricaoCompleta: "Torta de cookie recheada com creme de leite Ninho e Nutella, uma dupla clássica em formato de cookie quentinho.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Leite em pó Ninho", "Nutella", "Açúcar mascavo", "Ovos"],
    imagens: ["cookie-pie-ninhonutella-1.jpg"]
  },
  {
    id: 5,
    nome: "Cookie Pie Brigadeiro ao Leite",
    categoria: "cookie-pies",
    preco: 17.00,
    descricaoCurta: "Recheio de brigadeiro cremoso ao leite.",
    descricaoCompleta: "Massa de cookie recheada com brigadeiro cremoso ao leite, para quem não abre mão do sabor clássico brasileiro.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Brigadeiro ao leite", "Chocolate ao leite", "Açúcar mascavo", "Ovos"],
    imagens: ["cookie-pie-brigadeiro-1.jpg"]
  },
  {
    id: 6,
    nome: "Tradicional + Coca Zero",
    categoria: "combos",
    preco: 17.90,
    descricaoCurta: "1 cookies tradicionais à sua escolha + coca cola zero.",
    descricaoCompleta: "Combo perfeito para matar a vontade: cookie tradicional e leve uma coquinha para acompanhar.",
    ingredientes: ["cookies tradicionais", "Coca Cola Zero Lata"],
    imagens: ["combo-dupla-1.jpg"]
  },
  {
    id: 7,
    nome: "Combo Cookie Pie + Refrigerante",
    categoria: "combos",
    preco: 29.90,
    descricaoCurta: "1 Cookie Pie do sabor que preferir + refrigerante lata.",
    descricaoCompleta: "O combo mais pedido da casa: um Cookie Pie inteiro, do sabor que você escolher, acompanhado de um refrigerante gelado.",
    ingredientes: ["1 Cookie Pie (sabor à escolha)", "Refrigerante lata 350ml"],
    imagens: ["combo-cookiepie-1.jpg"]
  },
  {
    id: 8,
    nome: "Combo dupla Cookie Pìes",
    categoria: "combos",
    preco: 30.00,
    descricaoCurta: "2 cookies pies à sua escolha por R$ 30.",
    descricaoCompleta: "Combo com 2 cookies dos sabores que você preferir, por um preço especial de R$ 30.",
    ingredientes: ["2 cookies à escolha"],
    imagens: ["combo-doiscookies-1.jpg"]
  },
  {
    id: 9,
    nome: "Promoção: Leve 5 pague 4",
    categoria: "promocoes",
    preco: 68.00,
    descricaoCurta: "Compre 5 cookies pies a sua escolha e leve um cookie tradicional de chocolate de brinde!",
    descricaoCompleta: "Monte sua caixa com 5 cookies pies dos sabores que quiser e leve um cookie tradicional de bride. Promoção válida enquanto durarem os estoques do dia.",
    ingredientes: ["5 cookies pies a sua escolha"],
    imagens: ["promo-leve6-1.jpg"]
  }
];

/* ------------------------------------------------------------
   DESTAQUES — controla a ORDEM de prioridade na aba "Todos"
   IMPORTANTE: a aba "Todos" sempre mostra TODOS os produtos
   cadastrados em PRODUTOS, sem exceção. Você não precisa colocar
   um produto aqui para ele aparecer.

   Esta lista serve só para colocar produtos específicos na FRENTE
   da fila (ex: destacar uma promoção). Qualquer produto que não
   esteja nesta lista aparece do mesmo jeito, logo em seguida, na
   ordem em que foi cadastrado em PRODUTOS.

   COMO USAR:
   - Quer destacar um produto? Coloque o "id" dele aqui.
   - A ordem da lista é a ordem que aparece na tela.
   - Pode deixar vazia ([]) — nesse caso, a vitrine simplesmente
     segue a ordem de cadastro em PRODUTOS.
------------------------------------------------------------ */
const DESTAQUES = [9, 7, 8, 1, 2, 3, 4, 5, 6];
