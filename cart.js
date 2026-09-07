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
const CHAVE_ENDERECO = "carrinho_endereco_cliente";

/* ------------------------------------------------------------
   CARRINHO (itens)
------------------------------------------------------------ */
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

/* ------------------------------------------------------------
   ENDEREÇO — busca automática de CEP via ViaCEP (API pública,
   gratuita, sem necessidade de chave/cadastro).
   https://viacep.com.br

   Rua, bairro e cidade vêm automaticamente do CEP.
   Número é sempre digitado manualmente (o CEP não indica isso).
------------------------------------------------------------ */
function obterEndereco(){
  try{
    const dados = localStorage.getItem(CHAVE_ENDERECO);
    return dados ? JSON.parse(dados) : {};
  }catch(e){
    return {};
  }
}

function salvarEnderecoAtual(){
  const endereco = {
    cep: document.getElementById("campo-cep")?.value || "",
    rua: document.getElementById("campo-rua")?.value || "",
    bairro: document.getElementById("campo-bairro")?.value || "",
    cidade: document.getElementById("campo-cidade")?.value || "",
    numero: document.getElementById("campo-numero")?.value || ""
  };
  localStorage.setItem(CHAVE_ENDERECO, JSON.stringify(endereco));
}

function formatarCepDigitado(valor){
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  if(digitos.length > 5) return digitos.slice(0, 5) + "-" + digitos.slice(5);
  return digitos;
}

function limparCamposEndereco(){
  ["campo-rua", "campo-bairro", "campo-cidade"].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = "";
  });
}

function definirStatusCep(texto, tipo){
  const statusEl = document.getElementById("cep-status");
  if(!statusEl) return;
  statusEl.textContent = texto;
  statusEl.className = "cep-status" + (tipo ? ` ${tipo}` : "");
}

async function buscarEnderecoPorCep(){
  const campoCep = document.getElementById("campo-cep");
  if(!campoCep) return;

  const digitos = campoCep.value.replace(/\D/g, "");

  if(digitos.length !== 8){
    limparCamposEndereco();
    definirStatusCep(digitos.length === 0 ? "" : "CEP incompleto.", digitos.length === 0 ? "" : "erro");
    atualizarEstadoBotaoPedido();
    return;
  }

  definirStatusCep("Buscando endereço...", "buscando");

  try{
    const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
    const dados = await resposta.json();

    if(dados.erro){
      limparCamposEndereco();
      definirStatusCep("CEP não encontrado. Confira os números.", "erro");
      atualizarEstadoBotaoPedido();
      return;
    }

    document.getElementById("campo-rua").value = dados.logradouro || "";
    document.getElementById("campo-bairro").value = dados.bairro || "";
    document.getElementById("campo-cidade").value =
      [dados.localidade, dados.uf].filter(Boolean).join(" - ");

    definirStatusCep("Endereço encontrado ✓", "sucesso");
    salvarEnderecoAtual();
    atualizarEstadoBotaoPedido();

    // Se o CEP não tem número de rua associado (ex: alguns CEPs de zona
    // rural), o campo de número segue liberado para digitação manual.
    document.getElementById("campo-numero")?.focus();
  }catch(erro){
    definirStatusCep("Não deu pra buscar o CEP agora. Verifique sua internet.", "erro");
    atualizarEstadoBotaoPedido();
  }
}

/* ------------------------------------------------------------
   VALIDAÇÃO DO FORMULÁRIO
   Nome e CEP (com endereço resolvido) são obrigatórios para
   liberar o botão de pedido. Número é sempre manual e opcional.
------------------------------------------------------------ */
function formularioValido(){
  const nome = document.getElementById("campo-nome-cliente")?.value.trim() || "";
  const cepDigitos = (document.getElementById("campo-cep")?.value || "").replace(/\D/g, "");
  const ruaEncontrada = (document.getElementById("campo-rua")?.value || "").trim().length > 0;
  const itens = obterCarrinho();

  return nome.length > 0 && cepDigitos.length === 8 && ruaEncontrada && itens.length > 0;
}

function atualizarEstadoBotaoPedido(){
  const btnPedido = document.getElementById("btn-fazer-pedido");
  if(btnPedido) btnPedido.disabled = !formularioValido();
}

function carregarEnderecoSalvo(){
  const endereco = obterEndereco();
  const campoCep = document.getElementById("campo-cep");
  if(!campoCep) return;

  if(endereco.cep) campoCep.value = endereco.cep;
  if(endereco.rua) document.getElementById("campo-rua").value = endereco.rua;
  if(endereco.bairro) document.getElementById("campo-bairro").value = endereco.bairro;
  if(endereco.cidade) document.getElementById("campo-cidade").value = endereco.cidade;
  if(endereco.numero) document.getElementById("campo-numero").value = endereco.numero;
}

/* ------------------------------------------------------------
   RENDERIZAÇÃO DO CARRINHO
------------------------------------------------------------ */
function renderizarCarrinho(){
  const lista = document.getElementById("lista-carrinho");
  const totalEl = document.getElementById("carrinho-total-valor");
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

  atualizarEstadoBotaoPedido();
  atualizarBadgeCarrinho();
}

/* ------------------------------------------------------------
   MENSAGEM E ENVIO PARA O WHATSAPP
------------------------------------------------------------ */
function montarMensagemWhatsapp(){
  const itens = obterCarrinho();
  const nome = document.getElementById("campo-nome-cliente")?.value?.trim() || "";
  const cep = document.getElementById("campo-cep")?.value?.trim() || "";
  const rua = document.getElementById("campo-rua")?.value?.trim() || "";
  const numero = document.getElementById("campo-numero")?.value?.trim() || "";
  const bairro = document.getElementById("campo-bairro")?.value?.trim() || "";
  const cidade = document.getElementById("campo-cidade")?.value?.trim() || "";

  const linhasPedido = itens
    .map(i => `- ${i.quantidade}x ${i.nome} (${formatarPreco(i.preco * i.quantidade)})`)
    .join("\n");

  const total = formatarPreco(totalCarrinho());

  let mensagem = `Olá, gostaria de pedir:\n${linhasPedido}\n\nTotal: ${total}`;

  if(nome){
    mensagem += `\n\nNome: ${nome}`;
  }

  if(rua || cep){
    const linhaRua = numero ? `${rua}, nº ${numero}` : `${rua} (sem número informado)`;
    mensagem += `\nEndereço: ${linhaRua}`;
    if(bairro) mensagem += ` - ${bairro}`;
    if(cidade) mensagem += ` - ${cidade}`;
    if(cep) mensagem += ` (CEP: ${cep})`;
  }

  return mensagem;
}

function enviarPedidoWhatsapp(){
  if(!formularioValido()) return;

  salvarNomeCliente(document.getElementById("campo-nome-cliente")?.value?.trim() || "");
  salvarEnderecoAtual();

  const mensagem = montarMensagemWhatsapp();
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

/* ------------------------------------------------------------
   INICIALIZAÇÃO
------------------------------------------------------------ */
function iniciarCarrinho(){
  carregarEnderecoSalvo();
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
    atualizarEstadoBotaoPedido();
  });

  const campoCep = document.getElementById("campo-cep");
  if(campoCep){
    campoCep.addEventListener("input", (e) => {
      e.target.value = formatarCepDigitado(e.target.value);
      const digitos = e.target.value.replace(/\D/g, "");
      if(digitos.length === 8){
        buscarEnderecoPorCep();
      }else{
        limparCamposEndereco();
        definirStatusCep("", "");
        atualizarEstadoBotaoPedido();
      }
    });
    campoCep.addEventListener("blur", () => {
      const digitos = campoCep.value.replace(/\D/g, "");
      if(digitos.length === 8) buscarEnderecoPorCep();
    });
  }

  document.getElementById("campo-numero")?.addEventListener("input", () => {
    salvarEnderecoAtual();
  });

  // Rua, bairro e cidade vêm preenchidos pelo CEP, mas o cliente pode
  // corrigir manualmente (ex: CEP não muito preciso, endereço novo, etc.)
  ["campo-rua", "campo-bairro", "campo-cidade"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", () => {
      salvarEnderecoAtual();
      atualizarEstadoBotaoPedido();
    });
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") fecharCarrinho();
  });
}

document.addEventListener("DOMContentLoaded", iniciarCarrinho);
