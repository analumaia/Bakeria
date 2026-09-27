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
const ENDERECO_RETIRADA = "Rua Ponta Porã, 13 - Bairro Sumaré - Montes Claros/MG";

const CATEGORIAS = [
  { id: "tradicionais", nome: "Tradicionais",  subtitulo: "Os clássicos sem recheio, crocantes por fora e macios por dentro.", icone: "🍪" },
  { id: "cookie-pies",  nome: "Cookie Pies",   subtitulo: "Cookies com muuuuito recheio para matar a sua vontade de doce.", icone: "🥧" },
  { id: "combos",       nome: "Combos",        subtitulo: "Economize levando mais por menos!", icone: "🎁" },
  { id: "promocoes",    nome: "Promoções",     subtitulo: "Promoções exclusivas por tempo limitado, aproveite!", icone: "🔥" },
  { id: "encomendas",    nome: "Encomendas",     subtitulo: "Presenteie algum que ama ou a si mesmo! - Confirme a data da encomenda via whatsapp", icone: "🔥" },
];

/* ------------------------------------------------------------
   BANNERS DE PROMOÇÃO
   Adicione quantos objetos quiser no array — o site alterna
   entre eles automaticamente a cada 6 segundos. Para deixar
   fixo em um só, deixe apenas 1 item no array.
------------------------------------------------------------ */
const BANNERS = [
  {
    tag: "Promoção de lançamento!",
    titulo: "Leve os 4 sabores de cookie pie e ganhe um tradicional de brinde!",
    texto: "Garanta antes que seja tarde.",
    imagem: "Foto Combo de cookie pies.png",
    linkTexto: "Garantir minha promoção",
    linkCategoria: "promocoes"
  },
  {
    tag: "Leve dois por menos",
    titulo: "Dois cookie pies por apenas R$32,00",
    texto: "Aproveite e leve seus favoritos para casa com um desconto especial",
    imagem: "Foto Dupla de cookie pies.png",
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
    descricaoCurta: "Cookie crocante por fora, macio por dentro, com muitas gotas de chocolate.",
    descricaoCompleta: "O clássico cookie de massa de baunilha, com uma casquinha crocante por fora, e super macio por dentro. Feito com chocolate selecionado e assado na hora.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Gotas de chocolate meio amargo", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de milho", "Bicarbonato de sódio", "Fermento Químico"],
    imagens: ["Cookie tradicional.jpeg", "Cookie tradicional close.jpg"]
  },
  {
    id: 2,
    nome: "Cookie Pie Chocotella",
    categoria: "cookie-pies",
    preco: 18.00,
    descricaoCurta: "Cookie pie unitário com muuuuuita Nutella e lascas de avelã.",
    descricaoCompleta: "Cookie individual, com bordas crocantes e recheado com Nutella original. Para quem ama um doce.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Gotas de chocolate meio amargo", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de milho", "Bicarbonato de sódio", "Fermento Químico", "Nutella Original"],
    imagens: ["chocotella.jpg", "chocotella close.jpg"]
  },
  {
    id: 3,
    nome: "Cookie Pie Bueníssimo",
    categoria: "cookie-pies",
    preco: 18.00,
    descricaoCurta: "Cookie pie unitário com recheio cremoso de avelã e Kinder Bueno",
    descricaoCompleta: "Cookie individual com bordas crocantes, recheada com creme de chocolate e avelã e pedaço de Kinder Bueno por cima, para quem ama uma combinação irresistível.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Gotas de chocolate meio amargo", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de milho", "Bicarbonato de sódio", "Fermento Químico", "Kinder Bueno", "Avelã", "Chocolate Branco"],
    imagens: ["bueníssimo.jpg", "bueníssimo close.jpg"]
  },
  {
    id: 4,
    nome: "Cookie Pie Ninhotella",
    categoria: "cookie-pies",
    preco: 17.00,
    descricaoCurta: "Cookie Pie unitário com o clásico de brigadeiro de ninho com Nutella original, finalizado com leite em pó",
    descricaoCompleta: "Cookie individual com bordas crocantes, recheado com brigadeiro de leite ninho, Nutella original e leite em pó por cima, uma dupla clássica para quem gosta de equilíbrio.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Gotas de chocolate meio amargo", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de milho", "Bicarbonato de sódio", "Fermento Químico", "Leite em pó", "Leite condensado", "Creme de leite", "Nutella Original"],
    imagens: ["ninhotella.jpg","ninhotella close.jpg"]
  },
  {
    id: 5,
    nome: "Cookie Pie Brigs ao Leite",
    categoria: "cookie-pies",
    preco: 17.00,
    descricaoCurta: "Cookie Pie unitário com recheio de brigadeiro cremoso ao leite.",
    descricaoCompleta: "Cookie individual com bordas crocantes, recheado com um brigadeiro cremoso ao leite e granulados que geram nostalgia.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Gotas de chocolate meio amargo", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de milho", "Bicarbonato de sódio", "Fermento Químico", "Creme de leite", "Leite condensado", "Chocolate meio amargo", "Granulado"],
    imagens: ["brigs ao leite.jpg", "brigs ao leite close.jpg"]
  },
  {
    id: 6,
    nome: "Leve 3 por 2",
    categoria: "combos",
    preco: 28.00,
    descricaoCurta: "3 cookies tradicionais pelo preço de 2",
    descricaoCompleta: "Combo perfeito para quem ama um clássico, 3 cookies tradicionais pelo preço de 2",
    ingredientes: ["cookies tradicionais"],
    imagens: ["combo-dupla-1.jpg"]
  },
{
    id: 9,
    nome: "Promoção: Leve 5 pague 4",
    categoria: "promocoes",
    preco: 64.00,
    descricaoCurta: "Compre 5 cookies pies a sua escolha e leve um cookie tradicional de chocolate de brinde!",
    descricaoCompleta: "Monte sua caixa com 4 cookies pies dos sabores que quiser e leve um cookie tradicional de brinde. Promoção válida enquanto durarem os estoques do dia.",
    ingredientes: ["4 cookies pies a sua escolha","cookies tradicionais"],
    imagens: ["Combo leve 5 pague 4.jpgg"]
  },
  {
    id: 8,
    nome: "Combo dupla Cookie Pìes",
    categoria: "combos",
    preco: 32.00,
    descricaoCurta: "2 cookies pies à sua escolha por R$ 32.",
    descricaoCompleta: "Combo com 2 cookies dos sabores que você preferir, por um preço especial de R$ 32.",
    ingredientes: ["2 cookies à escolha"],
    imagens: ["Combo dupla.jpg"]
  },
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
