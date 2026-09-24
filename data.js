/* ============================================================
   DADOS DO SITE — este é o único arquivo que você precisa editar
   no dia a dia para adicionar, remover ou alterar produtos e banners.

   COMO ADICIONAR UM PRODUTO NOVO:
   1. Copie um bloco { ... } inteiro dentro do array PRODUTOS.
   2. Troque o "id" por um número que não exista ainda.
   3. Preencha os campos. "imagens" aceita 1 ou várias fotos.
   4. Salve o arquivo — o site atualiza sozinho.

   CATEGORIAS VÁLIDAS (use exatamente estes textos em "categoria"):
   "tradicionais" | "cookie-pies" | "combos" | "promocoes" | "encomendas"
   ============================================================ */

/* ------------------------------------------------------------
   ENDEREÇO DE RETIRADA
   Aparece no carrinho quando o cliente escolhe "Retirada" em vez
   de "Entrega". Troque pelo endereço real da sua loja/cozinha.
------------------------------------------------------------ */
const ENDERECO_RETIRADA = "Rua Ponta Porã, 13 - Bairro Sumaré - Montes Claros/MG";

/* ------------------------------------------------------------
   CUPONS DE DESCONTO
   O cliente digita o código no carrinho e clica em "Aplicar".
   O desconto vale sobre o subtotal dos produtos (não conta o frete,
   que é sempre combinado à parte pelo WhatsApp).

   COMO ADICIONAR UM CUPOM NOVO:
   - Use MAIÚSCULAS no código (o site já converte automaticamente
     o que o cliente digitar, então não precisa se preocupar com isso).
   - "tipo": "percentual" (desconto em %) ou "fixo" (valor em reais).
   - "descricao" aparece pro cliente quando o cupom é aplicado.

   COMO DESATIVAR UM CUPOM:
   - Apague o bloco inteiro, ou comente as linhas colocando // na frente.
------------------------------------------------------------ */
const CUPONS = {
  "BEMVINDO5": { tipo: "percentual", valor: 5, descricao: "10% de desconto" },
};

/* ------------------------------------------------------------
   HORÁRIO DE FUNCIONAMENTO
   Aparece numa aba logo abaixo do banner, mostrando "Aberto"/"Fechado"
   automaticamente, sempre seguindo o horário de Brasília — não importa
   de onde o cliente esteja acessando o site.

   COMO EDITAR:
   - Para um dia com atendimento, use: { abre: "09:00", fecha: "19:00" }
   - Para um dia sem atendimento (fechado o dia todo), use: null
   - Os horários usam formato 24h ("19:00", não "7:00 PM")
   - Só é possível um intervalo por dia (não dá pra configurar pausa de
     almoço com esse formato simples — se precisar disso, me avise).
------------------------------------------------------------ */
const HORARIO_FUNCIONAMENTO = {
  segunda: null,
  terca:   { abre: "18:00", fecha: "21:00" },
  quarta:  { abre: "18:00", fecha: "21:00" },
  quinta:  { abre: "18:00", fecha: "21:00" },
  sexta:   { abre: "18:00", fecha: "21:00" },
  sabado:  { abre: "12:00", fecha: "16:00" },
  domingo: { abre: "12:00", fecha: "16:00" }
};

// Usado só para exibir os nomes dos dias na lista expandida — não precisa editar.
const DIAS_SEMANA = [
  { chave: "segunda", nome: "Segunda-feira" },
  { chave: "terca",   nome: "Terça-feira" },
  { chave: "quarta",  nome: "Quarta-feira" },
  { chave: "quinta",  nome: "Quinta-feira" },
  { chave: "sexta",   nome: "Sexta-feira" },
  { chave: "sabado",  nome: "Sábado" },
  { chave: "domingo", nome: "Domingo" },
];

const CATEGORIAS = [
  { id: "tradicionais", nome: "Tradicionais",  subtitulo: "Cookies sem recheio mas com muito chocolate!", icone: "🍪" },
  { id: "cookie-pies",  nome: "Cookie Pies",   subtitulo: "Cookies recheados para matar a vontade de doce", icone: "🥧" },
  { id: "combos",       nome: "Combos",        subtitulo: "Leve mais por menos! Aproveite nossos combos", icone: "🎁" },
  { id: "promocoes",    nome: "Promoções",     subtitulo: "Promoções exclusivas por tempo limitado", icone: "🔥" },
  { id: "encomendas",   nome: "Encomendas",    subtitulo: "Tortas para presentear a si ou alguém que ama — combine a data de entrega", icone: "🎂" },
];

/* ------------------------------------------------------------
   BANNERS DE PROMOÇÃO
   Adicione quantos objetos quiser no array — o site alterna
   entre eles automaticamente a cada 6 segundos. Para deixar
   fixo em um só, deixe apenas 1 item no array.
------------------------------------------------------------ */
const BANNERS = [
  {
    tag: "Combo queridinho",
    titulo: "Dupla Cookie Pìes",
    texto: "Aproveite mais por menos levando dois cookies pies por preço promocional!",
    imagem: "banner-1.jpeg",
    linkTexto: "Garanta agora",
    linkCategoria: "combos"
  },
  {
    tag: "Promoção limitada",
    titulo: "Quer ganhar um tradicional de brinde?",
    texto: "Compre 5 cookie pies e ganhe um tradicional de brinde!",
    imagem: "banner-2.jpg",
    linkTexto: "Garantir promoção",
    linkCategoria: "promocoes"
  },
  {
    tag: "Presenteie quem você ama",
    titulo: "Nossas tortas cookies conquistam qualquer um",
    texto: "Faça sua encomenda e surpreenda quem você ama!",
    imagem: "banner-2.jpg",
    linkTexto: "Encomendar!",
    linkCategoria: "encomendas"
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
    descricaoCompleta: "Nosso cookie tradicional é feito com gotas de chocolate meio amargo e sabor de baunilha. Frequinho para garantir aquele centro macio e derretido.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Chocolate meio amargo", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de Milho" ],
    imagens: ["cookie-tradicional-1.jpg", "cookie-tradicional-2.jpg"]
  },
  {
    id: 2,
    nome: "Cookie Pie Chocotella",
    categoria: "cookie-pies",
    preco: 18.00,
    descricaoCurta: "Cookie pie servido com muuuuuita Nutella.",
    descricaoCompleta: "Uma torta de cookie individual, com bordas crocantes e recheado com nutella de verdade.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Chocolate meio amargo", "Nutella Original", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de Milho" ],
    imagens: ["cookie-pie-avela-1.jpg", "cookie-pie-avela-2.jpg", "cookie-pie-avela-3.jpg"]
  },
  {
    id: 3,
    nome: "Cookie Pie Bueníssimo",
    categoria: "cookie-pies",
    preco: 18.00,
    descricaoCurta: "Recheio cremoso com pedaços de Kinder Bueno e farofa de avelã.",
    descricaoCompleta: "Massa de cookie amanteigada recheada com creme de chocolate e pedaços de Kinder Bueno e farofa de avelã, para quem ama uma combinação irresistível.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Chocolate meio amargo", "Kinder Bueno", "Avelã", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de Milho" ],
    imagens: ["cookie-pie-kinderbueno-1.jpg"]
  },
  {
    id: 4,
    nome: "Cookie Pie Ninhotella",
    categoria: "cookie-pies",
    preco: 17.00,
    descricaoCurta: "Combinação perfeito de brigadeiro de leite Ninho com Nutella.",
    descricaoCompleta: "Torta de cookie recheada com brigadeiro de leite Ninho e Nutella, uma dupla clássica em formato de cookie quentinho.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Chocolate meio amargo", "Nutella Original", "Leite em pó", "Leite condensado", "Creme de leite", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de Milho" ],
    imagens: ["cookie-pie-ninhonutella-1.jpg"]
  },
  {
    id: 5,
    nome: "Cookie Pie Brigs ao Leite",
    categoria: "cookie-pies",
    preco: 17.00,
    descricaoCurta: "Recheio de brigadeiro cremoso ao leite para os amantes de chocolate.",
    descricaoCompleta: "Massa de cookie recheada com brigadeiro cremoso ao leite, para quem não abre mão do sabor clássico brasileiro.",
    ingredientes: ["Farinha de trigo", "Manteiga", "Chocolate meio amargo", "Cacau 50%", "Leite condensado", "Creme de leite", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de Milho" ],
    imagens: ["cookie-pie-brigadeiro-1.jpg"]
  },
  {
    id: 6,
    nome: "Leve 3 tradicionais, pague 2",
    categoria: "combos",
    preco: 28.00,
    descricaoCurta: "Leve 3 cookies tradicionais e pague apenas por 2 ",
    descricaoCompleta: "Combo perfeito para quem ama um cookie tradicional",
    ingredientes: ["cookies tradicionais"],
    imagens: ["combo-dupla-1.jpg"]
  },
  {
    id: 7,
    nome: "Dupla Cookie Pìes",
    categoria: "combos",
    preco: 30.00,
    descricaoCurta: "2 cookies pies à sua escolha por R$ 30,00!",
    descricaoCompleta: "Combo com 2 cookies dos sabores que você preferir, por um preço especial de R$ 30,00.",
    ingredientes: ["2 cookies à escolha"],
    imagens: ["combo-doiscookies-1.jpg"]
  },
  {
    id: 9,
    nome: "Promoção: Leve 5 pague 4",
    categoria: "promocoes",
    preco: 85.00,
    descricaoCurta: "Compre 5 cookies pies a sua escolha e leve um cookie tradicional de chocolate de brinde!",
    descricaoCompleta: "Monte sua caixa com 5 cookies pies dos sabores que quiser e leve um cookie tradicional de bride. Promoção válida enquanto durarem os estoques do dia.",
    ingredientes: ["5 cookies pies a sua escolha"],
    imagens: ["promo-leve6-1.jpg"]
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
const DESTAQUES = [9, 7, 6, 1, 2, 3, 4, 5];
