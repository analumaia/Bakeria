/* ============================================================
   MAIN.JS — roda apenas na página inicial (index.html)
   Renderiza o banner rotativo, o catálogo com filtro por categoria
   e o horário de funcionamento.
   Não precisa editar este arquivo: edite data.js.
   (Funções de data/hora e do carrinho ficam em cart.js.)
   ============================================================ */

/* ------------------------------------------------------------
   FOTO INDISPONÍVEL
   Usada quando o arquivo de imagem de um produto não carrega.
   IMPORTANTE: nunca usar this.src="" no lugar disso — isso faz o
   navegador recarregar a própria página como se fosse uma imagem,
   entra em loop e trava o carregamento do site.
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
      btn.addEventListener("click", () => {
        mostrarBanner(parseInt(btn.dataset.indice, 10));
        iniciarRotacaoBanner(); // reinicia a contagem dos 6s depois do clique
      });
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

  // Respeita quem pediu "reduzir movimento" no aparelho: sem troca automática.
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  temporizadorBanner = setInterval(() => {
    mostrarBanner((indiceBannerAtual + 1) % BANNERS.length);
  }, 6000);
}

/* ------------------------------------------------------------
   FILTRO LATERAL DE CATEGORIAS
   Categorias sem nenhum produto cadastrado ficam escondidas
   (evita o cliente clicar em "Promoções" e cair numa tela vazia).
------------------------------------------------------------ */
function categoriasComProdutos(){
  return CATEGORIAS.filter(c => PRODUTOS.some(p => p.categoria === c.id));
}

function renderizarFiltro(){
  const grade = document.getElementById("grade-filtro");
  if(!grade) return;

  const tiles = [
    { id: "todos", nome: "Todos", icone: "🍽️" },
    ...categoriasComProdutos()
  ];

  grade.innerHTML = tiles.map(cat => `
    <button type="button"
      class="tile-categoria ${cat.id === categoriaAtiva ? "ativa" : ""}"
      data-categoria="${cat.id}"
      aria-pressed="${cat.id === categoriaAtiva}"
      onclick="filtrarPorCategoria('${cat.id}')">
      <span class="tile-icone" aria-hidden="true">${cat.icone}</span>
      <span class="tile-nome">${cat.nome}</span>
    </button>
  `).join("");
}

function filtrarPorCategoria(idCategoria){
  categoriaAtiva = idCategoria;
  document.querySelectorAll(".tile-categoria").forEach(el => {
    const ativa = el.dataset.categoria === idCategoria;
    el.classList.toggle("ativa", ativa);
    el.setAttribute("aria-pressed", String(ativa));
  });
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
    // Dentro de uma categoria, mostra todos os produtos dela (inclusive os
    // marcados com visivelNaHome: false — essa flag só vale para a aba "Todos").
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
  // "Todos" mostra todos os produtos cadastrados, exceto os marcados com
  // visivelNaHome: false (ex.: produto ainda sem foto, ou item de apoio como
  // a vela). DESTAQUES só coloca produtos específicos primeiro na fila; o
  // resto vem em seguida, na ordem de cadastro em PRODUTOS.
  const visiveis = PRODUTOS.filter(p => p.visivelNaHome !== false);

  const destacados = (DESTAQUES || [])
    .map(id => visiveis.find(p => p.id === id))
    .filter(Boolean);

  const idsDestacados = new Set(destacados.map(p => p.id));
  const restantes = visiveis.filter(p => !idsDestacados.has(p.id));

  const produtosParaMostrar = [...destacados, ...restantes];

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

  // Sem foto cadastrada: não cria <img> (um src vazio dispara requisição inútil).
  const blocoImagem = imagem
    ? `<img src="${imagem}" alt="${produto.nome}" loading="lazy" onerror="marcarFotoIndisponivel(this)">`
    : `<span class="aviso-foto">🍪 Foto em breve</span>`;

  return `
    <article class="cartao-produto">
      <a class="imagem-produto" href="produto.html?id=${produto.id}">
        ${blocoImagem}
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

/* ------------------------------------------------------------
   HORÁRIO DE FUNCIONAMENTO
   Sempre calculado com base no horário de Brasília (fuso
   America/Sao_Paulo), não importa de onde o cliente está acessando.
   Edite os horários em data.js (HORARIO_FUNCIONAMENTO) — não aqui.
------------------------------------------------------------ */
function obterStatusFuncionamento(){
  const { diaSemana, hora, minuto } = obterDataHoraBrasilia();
  const horarioHoje = HORARIO_FUNCIONAMENTO[diaSemana];

  if(!horarioHoje){
    return { aberto: false, horarioHoje: null, diaSemana };
  }

  const agoraEmMinutos = (hora * 60) + minuto;
  const abreEmMinutos = minutosDesdeMeiaNoite(horarioHoje.abre);
  const fechaEmMinutos = minutosDesdeMeiaNoite(horarioHoje.fecha);

  const aberto = agoraEmMinutos >= abreEmMinutos && agoraEmMinutos < fechaEmMinutos;
  return { aberto, horarioHoje, diaSemana };
}

// Ex.: "Abre hoje às 17:00", "Abre amanhã às 13:30", "Abre quarta-feira às 17:00"
function textoProximaAbertura(){
  const proxima = proximaAbertura();
  if(!proxima) return "";
  const quando = proxima.deslocamento === 0 ? "hoje"
               : proxima.deslocamento === 1 ? "amanhã"
               : nomeDiaSemana(proxima.chave).toLowerCase();
  return `Abre ${quando} às ${proxima.abre}`;
}

function renderizarHorarioFuncionamento(){
  const bolinha = document.getElementById("horario-bolinha");
  const textoStatus = document.getElementById("horario-texto-status");
  const horarioHojeEl = document.getElementById("horario-hoje");
  const lista = document.getElementById("horario-lista");
  if(!bolinha || !textoStatus) return;

  const { aberto, horarioHoje, diaSemana } = obterStatusFuncionamento();

  bolinha.classList.toggle("aberto", aberto);
  bolinha.classList.toggle("fechado", !aberto);
  textoStatus.textContent = aberto ? "Aberto" : "Fechado";
  textoStatus.parentElement.classList.toggle("status-aberto", aberto);
  textoStatus.parentElement.classList.toggle("status-fechado", !aberto);

  if(horarioHojeEl){
    if(aberto){
      horarioHojeEl.textContent = `Hoje: ${horarioHoje.abre} às ${horarioHoje.fecha}`;
    }else{
      const proxima = textoProximaAbertura();
      const convite = horarioHoje ? "" : " · faça sua encomenda!";
      horarioHojeEl.textContent = proxima ? `${proxima}${convite}` : "Faça sua encomenda!";
    }
  }

  if(lista){
    lista.innerHTML = DIAS_SEMANA.map(d => {
      const h = HORARIO_FUNCIONAMENTO[d.chave];
      const ehHoje = d.chave === diaSemana;
      return `
        <div class="horario-linha ${ehHoje ? "horario-linha-hoje" : ""}">
          <span>${d.nome}${ehHoje ? " (hoje)" : ""}</span>
          <span>${h ? `${h.abre} às ${h.fecha}` : "Fechado"}</span>
        </div>
      `;
    }).join("");
  }
}

function iniciarHorarioFuncionamento(){
  renderizarHorarioFuncionamento();

  // Reavalia a cada minuto, caso o cliente deixe a aba aberta bem na
  // hora de abrir ou fechar a loja.
  setInterval(renderizarHorarioFuncionamento, 60000);

  document.getElementById("horario-resumo")?.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const lista = document.getElementById("horario-lista");
    const seta = document.getElementById("horario-seta");
    const estaAberta = !lista.hidden;

    lista.hidden = estaAberta;
    btn.setAttribute("aria-expanded", String(!estaAberta));
    if(seta) seta.textContent = estaAberta ? "▾" : "▴";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Permite abrir a home já filtrada, ex: index.html?categoria=cookie-pies
  const params = new URLSearchParams(window.location.search);
  const categoriaUrl = params.get("categoria");
  if(categoriaUrl && categoriasComProdutos().some(c => c.id === categoriaUrl)){
    categoriaAtiva = categoriaUrl;
  }

  renderizarBanners();
  renderizarFiltro();
  renderizarProdutos();

  try{
    iniciarHorarioFuncionamento();
  }catch(erro){
    // Se der erro aqui (ex: data.js desatualizado sem HORARIO_FUNCIONAMENTO),
    // mostra um aviso claro em vez de ficar travado em "Carregando horário..."
    console.error("Erro ao carregar horário de funcionamento:", erro);
    const textoStatus = document.getElementById("horario-texto-status");
    const horarioHojeEl = document.getElementById("horario-hoje");
    if(textoStatus) textoStatus.textContent = "Horário indisponível";
    if(horarioHojeEl) horarioHojeEl.textContent = "Atualize a página em alguns minutos";
  }
});
