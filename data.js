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
const ENDERECO_RETIRADA = "Não disponível";

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
  "BEMVINDO5": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKETHU": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKEMARI": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKELIVIA": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKESOFIA": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKEYZA": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKEVIRNA": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKESAM": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKEOCTAVIO": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKEALICE": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKEVICK": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKEAMANDA": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKEANALU": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKEPAOLA": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
  "BAKESARA": { tipo: "percentual", valor: 5, descricao: "5% de desconto" },
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
  terca:   null,
  quarta:  { abre: "17:00", fecha: "20:00" },
  quinta:  { abre: "17:00", fecha: "20:00" },
  sexta:   { abre: "17:00", fecha: "20:00" },
  sabado:  { abre: "13:30", fecha: "16:00" },
  domingo: { abre: "13:30", fecha: "16:00" }
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
  { id: "tradicionais", nome: "Tradicionais",  subtitulo: "Os clássicos sem recheio, crocantes por fora e macios por dentro.", icone: "🍪" },
  { id: "cookie-pies",  nome: "Cookie Pies",   subtitulo: "Cookies com muuuuito recheio para matar a sua vontade de doce.", icone: "🥧" },
  { id: "combos",       nome: "Combos",        subtitulo: "Economize levando mais por menos!", icone: "🎁" },
  { id: "promocoes",    nome: "Promoções",     subtitulo: "Promoções exclusivas por tempo limitado, aproveite!", icone: "🔥" },
  { id: "encomendas",    nome: "Encomendas",     subtitulo: "Presenteie algum que ama ou a si mesmo! - Confirme a data da encomenda via whatsapp", icone: "🎂" },
];

/* ------------------------------------------------------------
   BANNERS DE PROMOÇÃO
   Adicione quantos objetos quiser no array — o site alterna
   entre eles automaticamente a cada 6 segundos. Para deixar
   fixo em um só, deixe apenas 1 item no array.
------------------------------------------------------------ */
const BANNERS = [
  {
    tag: "Bento Cookies chegaram!",
    titulo: "Torne momentos em algo ainda mais especial",
    texto: "Comemore com nossos bento cookies",
    imagem: "banner-site.jpg",
    linkTexto: "Encomende o seu",
    linkCategoria: "encomendas"
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
    imagens: ["cookie-tradicional.jpeg", "tradicional-close.jpeg"]
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
    imagens: ["buenissimo.jpeg", "buenissimo close.jpeg"]
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
    categoria: "promocoes",
    preco: 28.00,
    descricaoCurta: "3 cookies tradicionais pelo preço de 2",
    descricaoCompleta: "Combo perfeito para quem ama um clássico, 3 cookies tradicionais pelo preço de 2",
    ingredientes: ["cookies tradicionais"],
    imagens: ["cookie 3 por 2.jpg"]
  },
  {
    id: 7,
    nome: "Combo dupla Cookie Pies",
    categoria: "combos",
    preco: 32.00,
    descricaoCurta: "2 cookies pies à sua escolha por R$ 32.",
    descricaoCompleta: "Combo com 2 cookies dos sabores que você preferir, por um preço especial de R$ 32.",
    ingredientes: ["2 cookies à escolha"],
    imagens: ["Combo dupla.jpg"]
  },
  {
    id: 8,
    nome: "Bento Cookie Brigs ao Leite",
    categoria: "encomendas",
    preco: 60.00,
    descricaoCurta: "Para tornar seu momento mais especial, serve 4 a 6 pessoas",
    descricaoCompleta: "Cookie de massa de baunilha com recheio de brigadeiro ao leite e confeitos coloridos assado em forma de 15cm. Perfeito para comemorar e presentear, tornando cada momento ainda mais especial. Capacidade de 14 letras ou símbolos, conferir custos adicionais. ",
    ingredientes: ["Farinha de trigo", "Manteiga", "Gotas de chocolate meio amargo", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de milho", "Bicarbonato de sódio", "Fermento Químico", "Creme de leite", "Leite condensado", "Chocolate meio amargo", "Granulado"],
    imagens: ["Foto produto.jpg"]
  },
  {
    id: 9,
    nome: "Bento Cookie Ninhotella",
    categoria: "encomendas",
    preco: 60.00,
    descricaoCurta: "Para tornar seu momento mais especial, serve 4 a 6 pessoas",
    descricaoCompleta: "Cookie de massa de baunilha com recheio de brigadeiro de ninho com nutella assado em forma de 15cm. Perfeito para comemorar e presentear, tornando cada momento ainda mais especial. Capacidade de 14 letras ou símbolos, conferir custos adicionais. ",
    ingredientes: ["Farinha de trigo", "Manteiga", "Gotas de chocolate meio amargo", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de milho", "Bicarbonato de sódio", "Fermento Químico", "Leite em pó", "Leite condensado", "Creme de leite", "Nutella Original"],
    imagens: [ ]
  },
  {
    id: 10,
    nome: "Bento Cookie Chocotella",
    categoria: "encomendas",
    preco: 75.00,
    descricaoCurta: "Para tornar seu momento mais especial, serve 4 a 6 pessoas",
    descricaoCompleta: "Cookie de massa de baunilha com recheio de nutella original com avelãs e farofa de avelã por cima assado em forma de 15cm. Perfeito para comemorar e presentear, tornando cada momento ainda mais especial. Capacidade de 14 letras ou símbolos, conferir custos adicionais. ",
    ingredientes: ["Farinha de trigo", "Manteiga", "Gotas de chocolate meio amargo", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de milho", "Bicarbonato de sódio", "Fermento Químico", "Nutella Original"],
    imagens: [ "bento-cookie-chocotella"]
  },
  {
    id: 11,
    nome: "Bento Cookie Bueníssimo",
    categoria: "encomendas",
    preco: 75.00,
    descricaoCurta: "Para tornar seu momento mais especial, serve 4 a 6 pessoas",
    descricaoCompleta: "Cookie de massa de baunilha com recheio de creme de avelã com chocolate branco e kinder bueno por cima assado em forma de 15cm. Perfeito para comemorar e presentear, tornando cada momento ainda mais especial. Capacidade de 14 letras ou símbolos, conferir custos adicionais. ",
    ingredientes:["Farinha de trigo", "Manteiga", "Gotas de chocolate meio amargo", "Açúcar mascavo", "Açúcar cristal", "Ovos", "Baunilha", "Amido de milho", "Bicarbonato de sódio", "Fermento Químico", "Kinder Bueno", "Avelã", "Chocolate Branco"],
    imagens: ["bento-cookie-buenissimo" ]
  },
  {
    id: 12,
    nome: "Adicional de Vela de Aniversário",
    categoria: "encomendas",
    preco: 1.50,
    descricaoCurta: "Para comemorar uma ocasião especial",
    descricaoCompleta: "Adicione uma vela de aniversário e comemore momentos com quem você ama!",
    ingredientes: ["Vela de Aniversário"],
    imagens: [ ]
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
const DESTAQUES = [7, 6, 1, 2, 3, 4, 5];
