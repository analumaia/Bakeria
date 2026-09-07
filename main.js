/* ============================================================
   MAIN.JS — roda apenas na página inicial (index.html)
   Renderiza o banner rotativo e os produtos por categoria.
   Não precisa editar este arquivo: edite js/data.js.
   ============================================================ */

let indiceBannerAtual = 0;
let temporizadorBanner = null;

function renderizarBanners(){
  const container = document.getElementById("banner-container");
  const pontosContainer = document.getElementById("banner-pontos");
  if(!container || BANNERS.length === 0) return;

  container.innerHTML = BANNERS.map((b, i) => `
    <div class="banner-slide ${i === 0 ? "ativo" : ""}" data-indice="${i}">
      <div class="banner-texto">
        <span class="tag">${b.tag}</span>
        <h2>${b.titulo}</h2>
        <p>${b.texto}</p>
        <a class="btn-primario" href="#categoria-${b.linkCategoria}">${b.linkTexto}</a>
      </div>
      <div class="banner-imagem">
        <img src="${b.imagem}" alt="${b.titulo}" onerror="this.parentElement.style.display='none'">
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

function renderizarProdutos(){
  const container = document.getElementById("categorias-container");
  if(!container) return;

  container.innerHTML = CATEGORIAS.map(cat => {
    const produtosDaCategoria = PRODUTOS.filter(p => p.categoria === cat.id);
    if(produtosDaCategoria.length === 0) return "";

    return `
      <section class="secao-categoria" id="categoria-${cat.id}">
        <h2>${cat.nome}</h2>
        <p class="subtitulo">${cat.subtitulo}</p>
        <div class="grid-produtos">
          ${produtosDaCategoria.map(cartaoProdutoHTML).join("")}
        </div>
      </section>
    `;
  }).join("");

  document.querySelectorAll("[data-qtd-produto]").forEach(el => {
    el.dataset.valor = "1";
  });
}

function cartaoProdutoHTML(produto){
  const imagem = (produto.imagens && produto.imagens[0]) || "";
  return `
    <article class="cartao-produto">
      <a class="imagem-produto" href="produto.html?id=${produto.id}">
        <img src="${imagem}" alt="${produto.nome}" onerror="this.src=''; this.alt='Foto em breve';">
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
  renderizarBanners();
  renderizarProdutos();
});
