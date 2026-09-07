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

const CATEGORIAS = [
  { id: "tradicionais", nome: "Tradicionais",  subtitulo: "Os clássicos que nunca saem de moda" },
  { id: "cookie-pies",  nome: "Cookie Pies",   subtitulo: "Cookie recheado, quentinho e generoso" },
  { id: "combos",       nome: "Combos",        subtitulo: "Mais sabor, mais economia" },
  { id: "promocoes",    nome: "Promoções",     subtitulo: "Por tempo limitado" },
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
    imagem: "assets/banner-1.jpg",
    linkTexto: "Ver promoções",
    linkCategoria: "promocoes"
  },
  {
    tag: "Novidade",
    titulo: "Cookie Pie de Doce de Leite",
    texto: "Chegou o sabor que você pediu — massa amanteigada e recheio cremoso.",
    imagem: "assets/banner-2.jpg",
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
    imagens: ["assets/produtos/cookie-tradicional-1.jpg", "assets/produtos/cookie-tradicional-2.jpg"]
  },
  {
    id: 2,
    nome: "Cookie Tradicional Nozes",
    categoria: "tradicionais",
    preco: 10.90,
    descricaoCurta: "Receita clássica com pedaços generosos de nozes.",
    descricaoCompleta: "Uma releitura crocante do clássico, com nozes selecionadas que dão o toque especial em cada mordida.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Nozes", "Açúcar mascavo", "Ovos"],
    imagens: ["assets/produtos/cookie-nozes-1.jpg"]
  },
  {
    id: 8,
    nome: "Tradicional",
    categoria: "tradicionais",
    preco: 14.00,
    descricaoCurta: "O cookie tradicional da casa, no ponto certo de crocância e maciez.",
    descricaoCompleta: "Nosso cookie tradicional, feito com a receita clássica da casa: crocante nas bordas e macio por dentro.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Açúcar mascavo", "Ovos", "Baunilha"],
    imagens: ["assets/produtos/tradicional-1.jpg"]
  },
  {
    id: 3,
    nome: "Cookie Pie Chocolate com Avelã",
    categoria: "cookie-pies",
    preco: 24.90,
    descricaoCurta: "Cookie gigante recheado, servido quentinho na embalagem.",
    descricaoCompleta: "Uma torta de cookie individual, com bordas crocantes e centro derretido recheado com creme de chocolate e avelã. Perfeito para comer de colher, ainda quentinho.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Creme de avelã", "Chocolate ao leite", "Açúcar", "Ovos"],
    imagens: ["assets/produtos/cookie-pie-avela-1.jpg", "assets/produtos/cookie-pie-avela-2.jpg", "assets/produtos/cookie-pie-avela-3.jpg"]
  },
  {
    id: 4,
    nome: "Cookie Pie Doce de Leite",
    categoria: "cookie-pies",
    preco: 24.90,
    descricaoCurta: "Massa amanteigada com recheio cremoso de doce de leite.",
    descricaoCompleta: "Nossa versão mais pedida: massa de cookie assada em formato de torta individual, recheada com doce de leite argentino e finalizada com flor de sal.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Doce de leite", "Açúcar mascavo", "Flor de sal", "Ovos"],
    imagens: ["assets/produtos/cookie-pie-docedeleite-1.jpg"]
  },
  {
    id: 9,
    nome: "Cookie Pie Nutella",
    categoria: "cookie-pies",
    preco: 17.00,
    descricaoCurta: "Massa de cookie recheada com Nutella cremosa.",
    descricaoCompleta: "Torta de cookie individual com recheio generoso de Nutella, servida quentinha para aproveitar o creme derretido.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Nutella", "Açúcar mascavo", "Ovos"],
    imagens: ["assets/produtos/cookie-pie-nutella-1.jpg"]
  },
  {
    id: 10,
    nome: "Cookie Pie Kinder Bueno",
    categoria: "cookie-pies",
    preco: 17.00,
    descricaoCurta: "Recheio cremoso com pedaços de Kinder Bueno.",
    descricaoCompleta: "Massa de cookie amanteigada recheada com creme de chocolate e pedaços de Kinder Bueno, para quem ama uma combinação irresistível.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Kinder Bueno", "Chocolate ao leite", "Açúcar mascavo", "Ovos"],
    imagens: ["assets/produtos/cookie-pie-kinderbueno-1.jpg"]
  },
  {
    id: 11,
    nome: "Cookie Pie Ninho com Nutella",
    categoria: "cookie-pies",
    preco: 17.00,
    descricaoCurta: "Combinação cremosa de leite Ninho com Nutella.",
    descricaoCompleta: "Torta de cookie recheada com creme de leite Ninho e Nutella, uma dupla clássica em formato de cookie quentinho.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Leite em pó Ninho", "Nutella", "Açúcar mascavo", "Ovos"],
    imagens: ["assets/produtos/cookie-pie-ninhonutella-1.jpg"]
  },
  {
    id: 12,
    nome: "Cookie Pie Brigadeiro ao Leite",
    categoria: "cookie-pies",
    preco: 17.00,
    descricaoCurta: "Recheio de brigadeiro cremoso ao leite.",
    descricaoCompleta: "Massa de cookie recheada com brigadeiro cremoso ao leite, para quem não abre mão do sabor clássico brasileiro.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Brigadeiro ao leite", "Chocolate ao leite", "Açúcar mascavo", "Ovos"],
    imagens: ["assets/produtos/cookie-pie-brigadeiro-1.jpg"]
  },
  {
    id: 5,
    nome: "Combo Dupla Tradicional",
    categoria: "combos",
    preco: 17.90,
    descricaoCurta: "2 cookies tradicionais à sua escolha + suco natural.",
    descricaoCompleta: "Combo perfeito para matar a vontade: escolha 2 sabores de cookie tradicional e leve um suco natural para acompanhar.",
    ingredientes: ["2 cookies tradicionais", "Suco natural 300ml"],
    imagens: ["assets/produtos/combo-dupla-1.jpg"]
  },
  {
    id: 6,
    nome: "Combo Cookie Pie + Refrigerante",
    categoria: "combos",
    preco: 29.90,
    descricaoCurta: "1 Cookie Pie do sabor que preferir + refrigerante lata.",
    descricaoCompleta: "O combo mais pedido da casa: um Cookie Pie inteiro, do sabor que você escolher, acompanhado de um refrigerante gelado.",
    ingredientes: ["1 Cookie Pie (sabor à escolha)", "Refrigerante lata 350ml"],
    imagens: ["assets/produtos/combo-cookiepie-1.jpg"]
  },
  {
    id: 13,
    nome: "Combo Dois Cookies",
    categoria: "combos",
    preco: 30.00,
    descricaoCurta: "2 cookies à sua escolha por R$ 30.",
    descricaoCompleta: "Combo com 2 cookies dos sabores que você preferir, por um preço especial de R$ 30. Também disponível na aba Promoções.",
    ingredientes: ["2 cookies à escolha"],
    imagens: ["assets/produtos/combo-doiscookies-1.jpg"]
  },
  {
    id: 7,
    nome: "Promoção: Leve 6 pague 5",
    categoria: "promocoes",
    preco: 49.50,
    descricaoCurta: "6 cookies tradicionais sortidos pelo preço de 5.",
    descricaoCompleta: "Monte sua caixa com 6 cookies tradicionais dos sabores que quiser e pague apenas 5. Promoção válida enquanto durarem os estoques do dia.",
    ingredientes: ["6 cookies tradicionais sortidos"],
    imagens: ["assets/produtos/promo-leve6-1.jpg"]
  },
  {
    id: 14,
    nome: "Combo Dois Cookies",
    categoria: "promocoes",
    preco: 30.00,
    descricaoCurta: "2 cookies à sua escolha por R$ 30.",
    descricaoCompleta: "Combo com 2 cookies dos sabores que você preferir, por um preço especial de R$ 30. Também disponível na aba Combos.",
    ingredientes: ["2 cookies à escolha"],
    imagens: ["assets/produtos/combo-doiscookies-1.jpg"]
  }
];
