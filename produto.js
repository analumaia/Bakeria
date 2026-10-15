/* ============================================================
   PRODUTO.JS — roda apenas em produto.html
   Lê o parâmetro ?id= da URL e monta a página de detalhe.
   ============================================================ */

let quantidadeSelecionada = 1;
let produtoAtual = null;
let imagensAtuais = [];

function obterIdDaURL(){
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get("id"), 10);
}

function renderizarProdutoDetalhe(){
  const container = document.getElementById("produto-detalhe-container");
  if(!container) return;

  const id = obterIdDaURL();
  produtoAtual = PRODUTOS.find(p => p.id === id);

  if(!produtoAtual){
    container.innerHTML = `
      <div style="text-align:center; padding: 60px 0;">
        <h1>Produto não encontrado</h1>
        <p><a href="index.html" class="voltar">&larr; Voltar para o cardápio</a></p>
      </div>
    `;
    return;
  }

  const categoriaInfo = CATEGORIAS.find(c => c.id === produtoAtual.categoria);
  document.title = `${produtoAtual.nome} — Bakeria`;

  imagensAtuais = (produtoAtual.imagens || []).filter(Boolean);
  const ingredientes = produtoAtual.ingredientes || [];

  // Sem foto cadastrada: mostra o aviso em vez de uma imagem quebrada (src="undefined").
  const galeriaHTML = imagensAtuais.length === 0
    ? `<div class="imagem-principal"><span class="aviso-foto">🍪 Foto em breve</span></div>`
    : `
      <div class="imagem-principal">
        <img id="imagem-principal-produto" src="${imagensAtuais[0]}" alt="${produtoAtual.nome}" onerror="this.style.opacity='0'">
      </div>
      ${imagensAtuais.length > 1 ? `
        <div class="miniaturas">
          ${imagensAtuais.map((img, i) => `
            <button type="button" class="${i === 0 ? "ativa" : ""}" onclick="trocarImagemGaleria(${i}, this)" aria-label="Ver foto ${i + 1}">
              <img src="${img}" alt="Foto ${i + 1} de ${produtoAtual.nome}" onerror="this.style.opacity='0.2'">
            </button>
          `).join("")}
        </div>
      ` : ""}
    `;

  container.innerHTML = `
    <a class="voltar" href="index.html?categoria=${produtoAtual.categoria}">&larr; Voltar para o cardápio</a>
    <div class="produto-detalhe">
      <div class="galeria">
        ${galeriaHTML}
      </div>
      <div class="info-produto">
        ${categoriaInfo ? `<span class="categoria-tag">${categoriaInfo.icone} ${categoriaInfo.nome}</span>` : ""}
        <h1>${produtoAtual.nome}</h1>
        <div class="preco-produto">${formatarPreco(produtoAtual.preco)}</div>
        <p class="descricao">${produtoAtual.descricaoCompleta}</p>
        ${ingredientes.length ? `
          <h4>Ingredientes</h4>
          <ul class="lista-ingredientes">
            ${ingredientes.map(ing => `<li>${ing}</li>`).join("")}
          </ul>
        ` : ""}
        <div class="acao-produto">
          <div class="seletor-qtd">
            <button type="button" onclick="alterarQtdDetalhe(-1)" aria-label="Diminuir quantidade">−</button>
            <span id="qtd-detalhe">1</span>
            <button type="button" onclick="alterarQtdDetalhe(1)" aria-label="Aumentar quantidade">+</button>
          </div>
          <button type="button" class="btn-adicionar-grande" onclick="adicionarDetalheAoCarrinho()">
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  `;
}

function trocarImagemGaleria(indice, botao){
  const principal = document.getElementById("imagem-principal-produto");
  if(principal && imagensAtuais[indice]){
    principal.style.opacity = "1";
    principal.src = imagensAtuais[indice];
  }
  document.querySelectorAll(".miniaturas button").forEach(b => b.classList.remove("ativa"));
  botao.classList.add("ativa");
}

function alterarQtdDetalhe(delta){
  quantidadeSelecionada = Math.max(1, quantidadeSelecionada + delta);
  document.getElementById("qtd-detalhe").textContent = quantidadeSelecionada;
}

function adicionarDetalheAoCarrinho(){
  if(!produtoAtual) return;
  adicionarAoCarrinho(produtoAtual, quantidadeSelecionada);
  quantidadeSelecionada = 1;
  document.getElementById("qtd-detalhe").textContent = 1;
}

document.addEventListener("DOMContentLoaded", renderizarProdutoDetalhe);
