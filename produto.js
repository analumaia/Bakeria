/* ============================================================
   PRODUTO.JS — roda apenas em produto.html
   Lê o parâmetro ?id= da URL e monta a página de detalhe.
   ============================================================ */

let quantidadeSelecionada = 1;
let produtoAtual = null;

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

  container.innerHTML = `
    <a class="voltar" href="index.html">&larr; Voltar para o cardápio</a>
    <div class="produto-detalhe">
      <div class="galeria">
        <div class="imagem-principal">
          <img id="imagem-principal-produto" src="${produtoAtual.imagens[0]}" alt="${produtoAtual.nome}" onerror="this.style.background='var(--bege)'">
        </div>
        ${produtoAtual.imagens.length > 1 ? `
          <div class="miniaturas">
            ${produtoAtual.imagens.map((img, i) => `
              <button type="button" class="${i === 0 ? "ativa" : ""}" onclick="trocarImagemGaleria('${img}', this)">
                <img src="${img}" alt="Foto ${i + 1} de ${produtoAtual.nome}" onerror="this.style.opacity='0.2'">
              </button>
            `).join("")}
          </div>
        ` : ""}
      </div>
      <div class="info-produto">
        ${categoriaInfo ? `<span class="categoria-tag">${categoriaInfo.nome}</span>` : ""}
        <h1>${produtoAtual.nome}</h1>
        <div class="preco-produto">${formatarPreco(produtoAtual.preco)}</div>
        <p class="descricao">${produtoAtual.descricaoCompleta}</p>
        <h4>Ingredientes</h4>
        <ul class="lista-ingredientes">
          ${produtoAtual.ingredientes.map(ing => `<li>${ing}</li>`).join("")}
        </ul>
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

function trocarImagemGaleria(src, botao){
  document.getElementById("imagem-principal-produto").src = src;
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
