/* ============================================================
   CARRINHO — lógica compartilhada entre index.html e produto.html
   Usa localStorage para o carrinho "seguir" o cliente entre páginas.

   NÚMERO DE WHATSAPP DA LOJA:
   Troque o valor de WHATSAPP_NUMERO abaixo (apenas números,
   com DDI 55 + DDD + número, sem espaços, sem "+").
   ============================================================ */

const WHATSAPP_NUMERO = "5538997248270";
const CHAVE_CARRINHO = "carrinho_delivery";
const CHAVE_NOME = "carrinho_nome_cliente";

function obterCarrinho(){
  try{
    const dados = localStorage.getItem(CHAVE_CARRINHO);
    return dados ? JSON.parse(dados) : [];
  }catch(e){
    return [];
  }
}

function salvarCarrinho(itens){
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
  atualizarBadgeCarrinho();
}

function obterNomeCliente(){
  return localStorage.getItem(CHAVE_NOME) || "";
}

function salvarNomeCliente(nome){
  localStorage.setItem(CHAVE_NOME, nome);
}

function adicionarAoCarrinho(produto, quantidade){
  if(quantidade <= 0) return;
  const itens = obterCarrinho();
  const existente = itens.find(i => i.id === produto.id);
  if(existente){
    existente.quantidade += quantidade;
  }else{
    itens.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: (produto.imagens && produto.imagens[0]) || "",
      quantidade: quantidade
    });
  }
  salvarCarrinho(itens);
  renderizarCarrinho();
  abrirCarrinho();
}

function removerDoCarrinho(id){
  const itens = obterCarrinho().filter(i => i.id !== id);
  salvarCarrinho(itens);
  renderizarCarrinho();
}

function alterarQuantidadeCarrinho(id, delta){
  const itens = obterCarrinho();
  const item = itens.find(i => i.id === id);
  if(!item) return;
  item.quantidade += delta;
  if(item.quantidade <= 0){
    return removerDoCarrinho(id);
  }
  salvarCarrinho(itens);
  renderizarCarrinho();
}

function totalCarrinho(){
  return obterCarrinho().reduce((soma, i) => soma + i.preco * i.quantidade, 0);
}

function quantidadeTotalCarrinho(){
  return obterCarrinho().reduce((soma, i) => soma + i.quantidade, 0);
}

function formatarPreco(valor){
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function atualizarBadgeCarrinho(){
  const badge = document.getElementById("badge-carrinho");
  if(!badge) return;
  const qtd = quantidadeTotalCarrinho();
  badge.textContent = qtd;
  badge.style.display = qtd > 0 ? "flex" : "none";
}

function abrirCarrinho(){
  document.getElementById("painel-carrinho")?.classList.add("aberto");
  document.getElementById("overlay-carrinho")?.classList.add("aberto");
}

function fecharCarrinho(){
  document.getElementById("painel-carrinho")?.classList.remove("aberto");
  document.getElementById("overlay-carrinho")?.classList.remove("aberto");
}

function renderizarCarrinho(){
  const lista = document.getElementById("lista-carrinho");
  const totalEl = document.getElementById("carrinho-total-valor");
  const btnPedido = document.getElementById("btn-fazer-pedido");
  const campoNome = document.getElementById("campo-nome-cliente");
  if(!lista) return;

  const itens = obterCarrinho();

  if(campoNome && !campoNome.value){
    campoNome.value = obterNomeCliente();
  }

  if(itens.length === 0){
    lista.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.<br>Adicione produtos para montar seu pedido.</p>';
  }else{
    lista.innerHTML = itens.map(item => `
      <div class="item-carrinho">
        <img src="${item.imagem}" alt="${item.nome}" onerror="this.style.display='none'">
        <div class="item-info">
          <strong>${item.nome}</strong>
          <span class="preco-unit">${formatarPreco(item.preco)} un.</span>
          <div class="seletor-qtd" style="margin-top:6px;">
            <button type="button" onclick="alterarQuantidadeCarrinho(${item.id}, -1)" aria-label="Diminuir quantidade">−</button>
            <span>${item.quantidade}</span>
            <button type="button" onclick="alterarQuantidadeCarrinho(${item.id}, 1)" aria-label="Aumentar quantidade">+</button>
          </div>
        </div>
        <button type="button" class="remover" onclick="removerDoCarrinho(${item.id})">Remover</button>
      </div>
    `).join("");
  }

  if(totalEl) totalEl.textContent = formatarPreco(totalCarrinho());
  if(btnPedido) btnPedido.disabled = itens.length === 0;

  atualizarBadgeCarrinho();
}

function montarMensagemWhatsapp(){
  const itens = obterCarrinho();
  const nome = document.getElementById("campo-nome-cliente")?.value?.trim() || "";

  const linhasPedido = itens
    .map(i => `- ${i.quantidade}x ${i.nome} (${formatarPreco(i.preco * i.quantidade)})`)
    .join("\n");

  const total = formatarPreco(totalCarrinho());

  let mensagem = `Olá, gostaria de pedir:\n${linhasPedido}\n\nTotal: ${total}`;
  if(nome){
    mensagem += `\n\nNome: ${nome}`;
  }
  return mensagem;
}

function enviarPedidoWhatsapp(){
  const itens = obterCarrinho();
  if(itens.length === 0) return;

  const nome = document.getElementById("campo-nome-cliente")?.value?.trim() || "";
  salvarNomeCliente(nome);

  const mensagem = montarMensagemWhatsapp();
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

function iniciarCarrinho(){
  atualizarBadgeCarrinho();
  renderizarCarrinho();

  document.getElementById("btn-abrir-carrinho")?.addEventListener("click", () => {
    renderizarCarrinho();
    abrirCarrinho();
  });
  document.getElementById("btn-fechar-carrinho")?.addEventListener("click", fecharCarrinho);
  document.getElementById("overlay-carrinho")?.addEventListener("click", fecharCarrinho);
  document.getElementById("btn-fazer-pedido")?.addEventListener("click", enviarPedidoWhatsapp);
  document.getElementById("campo-nome-cliente")?.addEventListener("input", (e) => {
    salvarNomeCliente(e.target.value);
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") fecharCarrinho();
  });
}

document.addEventListener("DOMContentLoaded", iniciarCarrinho);
