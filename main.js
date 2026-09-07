/* ============================================================
   MAIN.JS — roda apenas na página inicial (index.html)
   Renderiza o banner rotativo e o catálogo com filtro por categoria.
   Não precisa editar este arquivo: edite data.js.
   ============================================================ */

/* ------------------------------------------------------------
   FOTO INDISPONÍVEL
   Usada quando o arquivo de imagem de um produto ainda não foi
   adicionado. IMPORTANTE: nunca usar this.src="" no lugar disso —
   isso faz o navegador recarregar a própria página como se fosse
   uma imagem, entra em loop e trava o carregamento do site.
------------------------------------------------------------ */
function marcarFotoIndisponivel(img){
  img.onerror = null; // evita disparar de novo caso o pixel também falhe
  img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  img.classList.add("foto-indisponivel");
  const container = img.closest(".imagem-produto");
  if(container && !container.querySelector(".aviso-foto")){
    container.insertAdjacentHTML("beforeend", '<span class="aviso-foto">🍪 Foto em breve</span>');
  }
}

let indiceBannerAtual = 0;
let temporizadorBanner = null;
let categoriaAtiva = "todos";

/* ------------------------------------------------------------
   BANNER (imagem cheia com texto sobreposto)
------------------------------------------------------------ */
function renderizarBanners(){
  const container = document.getElementById("banner-container");
  const pontosContainer = document.getElementById("banner-pontos");
  if(!container || BANNERS.length === 0) return;

  container.innerHTML = BANNERS.map((b, i) => `
    <div class="banner-slide ${i === 0 ? "ativo" : ""}" data-indice="${i}">
      <img class="banner-imagem-fundo" src="${b.imagem}" alt="${b.titulo}" onerror="this.style.opacity='0'">
      <div class="banner-conteudo">
        <span class="tag">${b.tag}</span>
        <h2>${b.titulo}</h2>
        <p>${b.texto}</p>
        <button type="button" class="btn-primario" onclick="filtrarPorCategoria('${b.linkCategoria}')">${b.linkTexto}</button>
      </div>
    </div>
  `).join("");

  if(BANNERS.length > 1 && pontosContainer){
    pontosContainer.innerHTML = BANNERS.map((_, i) =>
      `<button type="button" class="${i === 0 ? "ativo" : ""}" data-indice="${i}" aria-label="Ver promoção ${i + 1}"></button>`
    ).join("");

    pontosContainer.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => mostrarBanner(parseInt(btn.dataset.indice, 10)));
    });

    iniciarRotacaoBanner();
  }
}

function mostrarBanner(indice){
  indiceBannerAtual = indice;
  document.querySelectorAll(".banner-slide").forEach(el =>
    el.classList.toggle("ativo", parseInt(el.dataset.indice, 10) === indice)
  );
  document.querySelectorAll("#banner-pontos button").forEach(el =>
    el.classList.toggle("ativo", parseInt(el.dataset.indice, 10) === indice)
  );
}

function iniciarRotacaoBanner(){
  clearInterval(temporizadorBanner);
  temporizadorBanner = setInterval(() => {
    mostrarBanner((indiceBannerAtual + 1) % BANNERS.length);
  }, 6000);
}

/* ------------------------------------------------------------
   FILTRO LATERAL DE CATEGORIAS
------------------------------------------------------------ */
function renderizarFiltro(){
  const grade = document.getElementById("grade-filtro");
  if(!grade) return;

  const tiles = [
    { id: "tradicionais","cookie-pies","combos", "promocoes", nome: "Todos", icone: "🍽️" },
    ...CATEGORIAS
  ];

  grade.innerHTML = tiles.map(cat => `
    <button type="button"
      class="tile-categoria ${cat.id === categoriaAtiva ? "ativa" : ""}"
      data-categoria="${cat.id}"
      onclick="filtrarPorCategoria('${cat.id}')">
      <span class="tile-icone">${cat.icone}</span>
      <span class="tile-nome">${cat.nome}</span>
    </button>
  `).join("");
}

function filtrarPorCategoria(idCategoria){
  categoriaAtiva = idCategoria;
  document.querySelectorAll(".tile-categoria").forEach(el =>
    el.classList.toggle("ativa", el.dataset.categoria === idCategoria)
  );
  renderizarProdutos();
  document.getElementById("categorias-container")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ------------------------------------------------------------
   PRODUTOS
------------------------------------------------------------ */
function renderizarProdutos(){
  const container = document.getElementById("categorias-container");
  if(!container) return;

  if(categoriaAtiva === "todos"){
    renderizarVitrineDestaques(container);
    return;
  }

  const categoriasParaMostrar = CATEGORIAS.filter(c => c.id === categoriaAtiva);

  container.innerHTML = categoriasParaMostrar.map(cat => {
    const produtosDaCategoria = PRODUTOS.filter(p => p.categoria === cat.id);
    if(produtosDaCategoria.length === 0) return "";

    return `
      <section class="secao-categoria" id="categoria-${cat.id}">
        <h2><span class="titulo-icone">${cat.icone}</span> ${cat.nome}</h2>
        <p class="subtitulo">${cat.subtitulo}</p>
        <div class="grid-produtos">
          ${produtosDaCategoria.map(cartaoProdutoHTML).join("")}
        </div>
      </section>
    `;
  }).join("") || `<p class="sem-produtos">Nenhum produto encontrado nessa categoria.</p>`;
}

function renderizarVitrineDestaques(container){
  // Sem agrupar por categoria: mostra uma vitrine única, na ordem
  // definida em DESTAQUES (ou na ordem de cadastro, se DESTAQUES estiver vazio).
  let produtosParaMostrar;

  if(DESTAQUES && DESTAQUES.length > 0){
    produtosParaMostrar = DESTAQUES
      .map(id => PRODUTOS.find(p => p.id === id))
      .filter(Boolean);
  }else{
    produtosParaMostrar = PRODUTOS;
  }

  if(produtosParaMostrar.length === 0){
    container.innerHTML = `<p class="sem-produtos">Nenhum produto cadastrado ainda.</p>`;
    return;
  }

  container.innerHTML = `
    <section class="secao-categoria secao-vitrine">
      <div class="grid-produtos">
        ${produtosParaMostrar.map(cartaoProdutoHTML).join("")}
      </div>
    </section>
  `;
}

function cartaoProdutoHTML(produto){
  const imagem = (produto.imagens && produto.imagens[0]) || "";
  const categoriaInfo = CATEGORIAS.find(c => c.id === produto.categoria);
  return `
    <article class="cartao-produto">
      <a class="imagem-produto" href="produto.html?id=${produto.id}">
        <img src="${imagem}" alt="${produto.nome}" onerror="marcarFotoIndisponivel(this)">
        ${categoriaInfo ? `<span class="mini-tag">${categoriaInfo.icone} ${categoriaInfo.nome}</span>` : ""}
      </a>
      <div class="info">
        <h3>${produto.nome}</h3>
        <p class="desc-curta">${produto.descricaoCurta}</p>
        <span class="preco">${formatarPreco(produto.preco)}</span>
        <a class="link-detalhe" href="produto.html?id=${produto.id}">Ver detalhes</a>
        <div class="linha-acoes">
          <div class="seletor-qtd" data-qtd-produto="${produto.id}" data-valor="1">
            <button type="button" onclick="alterarQtdCard(${produto.id}, -1)" aria-label="Diminuir quantidade">−</button>
            <span>1</span>
            <button type="button" onclick="alterarQtdCard(${produto.id}, 1)" aria-label="Aumentar quantidade">+</button>
          </div>
          <button type="button" class="btn-adicionar" onclick="adicionarCard(${produto.id})">Adicionar</button>
        </div>
      </div>
    </article>
  `;
}

function alterarQtdCard(id, delta){
  const el = document.querySelector(`[data-qtd-produto="${id}"]`);
  if(!el) return;
  let valor = parseInt(el.dataset.valor, 10) + delta;
  if(valor < 1) valor = 1;
  el.dataset.valor = valor;
  el.querySelector("span").textContent = valor;
}

function adicionarCard(id){
  const produto = PRODUTOS.find(p => p.id === id);
  if(!produto) return;
  const el = document.querySelector(`[data-qtd-produto="${id}"]`);
  const quantidade = el ? parseInt(el.dataset.valor, 10) : 1;
  adicionarAoCarrinho(produto, quantidade);
  if(el){
    el.dataset.valor = "1";
    el.querySelector("span").textContent = "1";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Permite abrir a home já filtrada, ex: index.html?categoria=promocoes
  const params = new URLSearchParams(window.location.search);
  const categoriaUrl = params.get("categoria");
  if(categoriaUrl && (categoriaUrl === "todos" || CATEGORIAS.some(c => c.id === categoriaUrl))){
    categoriaAtiva = categoriaUrl;
  }

  renderizarBanners();
  renderizarFiltro();
  renderizarProdutos();
});
