/* ============================================================
   CARRINHO — lógica compartilhada entre index.html e produto.html
   Usa localStorage para o carrinho "seguir" o cliente entre páginas.

   NÚMERO DE WHATSAPP DA LOJA:
   Troque o valor de WHATSAPP_NUMERO abaixo (apenas números,
   com DDI 55 + DDD + número, sem espaços, sem "+").

   ORGANIZAÇÃO DESTE ARQUIVO:
   1. Constantes e utilitários (storage, HTML seguro, data/hora)
   2. Itens do carrinho
   3. Cupom de desconto
   4. Abrir/fechar painel, aviso rápido (toast)
   5. Entrega/retirada e endereço (ViaCEP)
   6. Validação do pedido
   7. Renderização do carrinho
   8. Mensagem e envio para o WhatsApp
   9. Rodapé com contato
   10. Inicialização
   ============================================================ */

const WHATSAPP_NUMERO = "5538997248270";
const CHAVE_CARRINHO = "carrinho_delivery";
const CHAVE_NOME = "carrinho_nome_cliente";
const CHAVE_ENDERECO = "carrinho_endereco_cliente";
const CHAVE_TIPO_ENTREGA = "carrinho_tipo_entrega";
const CHAVE_CUPOM = "carrinho_cupom_aplicado";

const LIMITE_OBS = 140;
const FUSO_LOJA = "America/Sao_Paulo";
const CHAVES_DIA = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const NOMES_DIA_CURTO = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/* ============================================================
   1. UTILITÁRIOS
   ============================================================ */
function $id(id){ return document.getElementById(id); }

// Evita que texto digitado pelo cliente quebre o HTML (ou injete código).
function escaparHTML(texto){
  const mapa = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(texto ?? "").replace(/[&<>"']/g, c => mapa[c]);
}

function semAcento(texto){
  return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function formatarPreco(valor){
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* localStorage pode falhar (navegação anônima, armazenamento cheio).
   Estes atalhos nunca deixam o site quebrar por causa disso. */
function lerStorage(chave, padrao = ""){
  try{
    const valor = localStorage.getItem(chave);
    return valor === null ? padrao : valor;
  }catch(e){
    return padrao;
  }
}
function gravarStorage(chave, valor){
  try{ localStorage.setItem(chave, valor); }catch(e){ /* segue sem salvar */ }
}
function apagarStorage(chave){
  try{ localStorage.removeItem(chave); }catch(e){ /* segue */ }
}

/* ------------------------------------------------------------
   DATA E HORA — sempre no fuso de Brasília (America/Sao_Paulo),
   independente do relógio/fuso do aparelho do cliente.
   (toISOString() usa UTC e devolveria "amanhã" a partir das 21h.)
------------------------------------------------------------ */
function obterDataHoraBrasilia(){
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO_LOJA,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const m = {};
  partes.forEach(p => { m[p.type] = p.value; });

  const dias = {
    sunday: "domingo", monday: "segunda", tuesday: "terca", wednesday: "quarta",
    thursday: "quinta", friday: "sexta", saturday: "sabado"
  };

  return {
    diaSemana: dias[(m.weekday || "").toLowerCase()],
    hora: parseInt(m.hour, 10) % 24, // alguns navegadores devolvem "24" à meia-noite
    minuto: parseInt(m.minute, 10)
  };
}

function obterDataISOHoje(){
  // "en-CA" formata como AAAA-MM-DD, o mesmo formato do <input type="date">
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO_LOJA }).format(new Date());
}

function addDiasISO(iso, dias){
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

function indiceDiaSemanaISO(iso){
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

function chaveDiaSemanaISO(iso){
  return CHAVES_DIA[indiceDiaSemanaISO(iso)];
}

function minutosDesdeMeiaNoite(horaStr){
  const [h, m] = horaStr.split(":").map(Number);
  return (h * 60) + m;
}

function nomeDiaSemana(chave){
  return (DIAS_SEMANA.find(d => d.chave === chave) || {}).nome || chave;
}

/* Próximo momento em que a loja está (ou estará) aberta. Considera o dia
   de hoje apenas se ainda não passou do horário de fechar. */
function proximaAbertura(){
  const { hora, minuto } = obterDataHoraBrasilia();
  const agora = (hora * 60) + minuto;
  const hoje = obterDataISOHoje();

  for(let i = 0; i <= 7; i++){
    const iso = addDiasISO(hoje, i);
    const chave = chaveDiaSemanaISO(iso);
    const h = HORARIO_FUNCIONAMENTO[chave];
    if(!h) continue;
    if(i === 0 && agora >= minutosDesdeMeiaNoite(h.fecha)) continue;
    return { iso, deslocamento: i, chave, abre: h.abre };
  }
  return null;
}

// Data sugerida por padrão para produtos de pronta-entrega.
function proximaDataAtendimento(){
  const p = proximaAbertura();
  return p ? p.iso : obterDataISOHoje();
}

// Encomenda não recebe data padrão: o cliente precisa escolher de propósito.
function dataPadraoPara(produto){
  return produto && produto.categoria === "encomendas" ? "" : proximaDataAtendimento();
}

function formatarDataEntregaExibicao(valorISO){
  // Converte "2026-09-20" (formato do input date) para "20/09/2026"
  if(!valorISO) return "";
  const [ano, mes, dia] = valorISO.split("-");
  if(!ano || !mes || !dia) return valorISO;
  return `${dia}/${mes}/${ano}`;
}

function textoDicaDia(iso){
  if(!iso) return "";
  if(!HORARIO_FUNCIONAMENTO[chaveDiaSemanaISO(iso)]){
    return "⚠️ Não temos atendimento nesse dia da semana — confirme a data pelo WhatsApp.";
  }
  return "";
}

/* ============================================================
   2. ITENS DO CARRINHO
   O localStorage guarda só o essencial (id, quantidade, data, obs).
   Nome, preço e foto são relidos de data.js a cada leitura, então
   mudar um preço em data.js vale na hora para todo mundo, e produto
   removido some do carrinho sozinho.
   ============================================================ */
function obterCarrinho(){
  let salvos = [];
  try{
    salvos = JSON.parse(lerStorage(CHAVE_CARRINHO, "[]")) || [];
  }catch(e){
    salvos = [];
  }
  if(!Array.isArray(salvos)) return [];

  const hoje = obterDataISOHoje();

  return salvos.map(item => {
    const produto = PRODUTOS.find(p => p.id === item.id);
    if(!produto) return null;

    let data = item.dataEntrega || "";
    if(data && data < hoje) data = dataPadraoPara(produto); // data que já passou

    return {
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      categoria: produto.categoria,
      addon: !!produto.addonVela,
      imagem: (produto.imagens && produto.imagens[0]) || "",
      quantidade: Math.max(1, parseInt(item.quantidade, 10) || 1),
      dataEntrega: data,
      obs: String(item.obs || "").slice(0, LIMITE_OBS)
    };
  }).filter(Boolean);
}

function salvarCarrinho(itens){
  const minimo = itens.map(i => ({
    id: i.id,
    quantidade: i.quantidade,
    dataEntrega: i.dataEntrega,
    obs: i.obs
  }));
  gravarStorage(CHAVE_CARRINHO, JSON.stringify(minimo));
  atualizarBadgeCarrinho();
}

function obterNomeCliente(){
  return lerStorage(CHAVE_NOME, "");
}

function salvarNomeCliente(nome){
  gravarStorage(CHAVE_NOME, nome);
}

function adicionarAoCarrinho(produto, quantidade, opcoes = {}){
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
      categoria: produto.categoria,
      imagem: (produto.imagens && produto.imagens[0]) || "",
      quantidade: quantidade,
      dataEntrega: opcoes.dataEntrega !== undefined ? opcoes.dataEntrega : dataPadraoPara(produto),
      obs: ""
    });
  }

  salvarCarrinho(itens);
  renderizarCarrinho();

  // Em vez de abrir o carrinho a cada clique (atrapalha quem leva vários
  // produtos), mostra um aviso rápido e faz o contador "pulsar".
  if(!opcoes.silencioso){
    mostrarToast(`${quantidade}x ${produto.nome} adicionado ✓`);
    pulsarBadge();
  }
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

/* Data vinculada a CADA item (dá pra pedir um cookie para hoje junto
   com uma encomenda para daqui a alguns dias). */
function atualizarDataItemCarrinho(id, novaData){
  const itens = obterCarrinho();
  const item = itens.find(i => i.id === id);
  if(!item) return;

  if(novaData && novaData < obterDataISOHoje()){
    mostrarToast("Essa data já passou. Escolha uma data a partir de hoje.", false);
  }

  item.dataEntrega = novaData;
  salvarCarrinho(itens);

  // Atualiza só o aviso de dia sem atendimento, sem redesenhar a lista toda.
  const dica = $id(`dica-dia-${id}`);
  if(dica) dica.textContent = textoDicaDia(novaData);

  // Data passada é trocada pela data padrão ao reler o carrinho
  if(novaData && novaData < obterDataISOHoje()) renderizarCarrinho();
}

function atualizarObsItem(id, valor){
  const itens = obterCarrinho();
  const item = itens.find(i => i.id === id);
  if(!item) return;
  item.obs = String(valor || "").slice(0, LIMITE_OBS);
  salvarCarrinho(itens);
}

function totalCarrinho(){
  return obterCarrinho().reduce((soma, i) => soma + i.preco * i.quantidade, 0);
}

function quantidadeTotalCarrinho(){
  return obterCarrinho().reduce((soma, i) => soma + i.quantidade, 0);
}

function adicionarVelaSugerida(){
  const vela = PRODUTOS.find(p => p.addonVela);
  if(!vela) return;
  const referencia = obterCarrinho().find(i => i.categoria === "encomendas" && !i.addon);
  adicionarAoCarrinho(vela, 1, {
    silencioso: true,
    dataEntrega: referencia ? referencia.dataEntrega : ""
  });
}

/* ============================================================
   3. CUPOM DE DESCONTO
   Vale sobre o subtotal dos produtos. Frete não entra nessa conta,
   já que é sempre combinado à parte pelo WhatsApp.
   ============================================================ */
function obterCupomAplicado(){
  return lerStorage(CHAVE_CUPOM, "");
}

function salvarCupomAplicado(codigo){
  gravarStorage(CHAVE_CUPOM, codigo);
}

function removerCupomAplicado(){
  apagarStorage(CHAVE_CUPOM);
}

function obterConfigCupomValido(){
  const codigo = obterCupomAplicado();
  if(!codigo) return null;
  const config = CUPONS[codigo];
  return config ? { codigo, ...config } : null;
}

function calcularDesconto(subtotal){
  const cupom = obterConfigCupomValido();
  if(!cupom) return 0;

  if(cupom.tipo === "percentual"){
    return subtotal * (cupom.valor / 100);
  }
  if(cupom.tipo === "fixo"){
    return Math.min(cupom.valor, subtotal); // nunca deixa o desconto passar do subtotal
  }
  return 0;
}

function totalComDesconto(){
  const subtotal = totalCarrinho();
  return Math.max(0, subtotal - calcularDesconto(subtotal));
}

function exibirCupomAplicadoNoStatus(cupom){
  const statusEl = $id("cupom-status");
  if(!statusEl) return;
  statusEl.innerHTML = `Cupom aplicado: ${escaparHTML(cupom.descricao)} ✓ <button type="button" class="link-remover-cupom" onclick="removerCupom()">Remover</button>`;
  statusEl.className = "cupom-status sucesso";
}

function aplicarCupom(){
  const input = $id("campo-cupom");
  const statusEl = $id("cupom-status");
  const codigoDigitado = (input?.value || "").trim().toUpperCase();

  if(!codigoDigitado){
    if(statusEl){ statusEl.textContent = "Digite um código de cupom."; statusEl.className = "cupom-status erro"; }
    return;
  }

  if(!CUPONS[codigoDigitado]){
    removerCupomAplicado();
    if(statusEl){ statusEl.textContent = "Cupom inválido ou expirado."; statusEl.className = "cupom-status erro"; }
    renderizarCarrinho();
    return;
  }

  salvarCupomAplicado(codigoDigitado);
  if(input) input.value = codigoDigitado;
  exibirCupomAplicadoNoStatus(CUPONS[codigoDigitado]);
  renderizarCarrinho();
}

function removerCupom(){
  removerCupomAplicado();
  const input = $id("campo-cupom");
  const statusEl = $id("cupom-status");
  if(input) input.value = "";
  if(statusEl){ statusEl.textContent = ""; statusEl.className = "cupom-status"; }
  renderizarCarrinho();
}

/* ============================================================
   4. PAINEL DO CARRINHO E AVISO RÁPIDO (TOAST)
   Com o painel aberto, o resto da página fica "inerte" (não recebe
   foco por Tab nem leitor de tela) e o fundo para de rolar. Com ele
   fechado, é o painel que fica inerte.
   ============================================================ */
let ultimoElementoFocado = null;
const SELETORES_FUNDO = "header.cabecalho, main, footer.rodape";

function definirFundoInerte(valor){
  document.querySelectorAll(SELETORES_FUNDO).forEach(el => { el.inert = valor; });
}

function abrirCarrinho(){
  const painel = $id("painel-carrinho");
  if(!painel || painel.classList.contains("aberto")) return;

  ultimoElementoFocado = document.activeElement;
  painel.inert = false;
  painel.classList.add("aberto");
  $id("overlay-carrinho")?.classList.add("aberto");
  document.body.classList.add("carrinho-aberto");
  definirFundoInerte(true);
  $id("btn-fechar-carrinho")?.focus();
}

function fecharCarrinho(){
  const painel = $id("painel-carrinho");
  if(!painel) return;

  painel.classList.remove("aberto");
  painel.inert = true;
  $id("overlay-carrinho")?.classList.remove("aberto");
  document.body.classList.remove("carrinho-aberto");
  definirFundoInerte(false);

  if(ultimoElementoFocado && typeof ultimoElementoFocado.focus === "function"){
    ultimoElementoFocado.focus();
  }
  ultimoElementoFocado = null;
}

let temporizadorToast = null;

function mostrarToast(texto, comAcaoCarrinho = true){
  let toast = $id("toast-carrinho");
  if(!toast){
    toast = document.createElement("div");
    toast.id = "toast-carrinho";
    toast.className = "toast-carrinho";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.textContent = "";
  const span = document.createElement("span");
  span.textContent = texto;
  toast.appendChild(span);

  if(comAcaoCarrinho){
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = "Ver carrinho";
    botao.addEventListener("click", () => {
      toast.classList.remove("visivel");
      renderizarCarrinho();
      abrirCarrinho();
    });
    toast.appendChild(botao);
  }

  toast.classList.add("visivel");
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => toast.classList.remove("visivel"), 3500);
}

function pulsarBadge(){
  const badge = $id("badge-carrinho");
  if(!badge) return;
  badge.classList.remove("pulsar");
  void badge.offsetWidth; // reinicia a animação
  badge.classList.add("pulsar");
}

function atualizarBadgeCarrinho(){
  const badge = $id("badge-carrinho");
  if(!badge) return;
  const qtd = quantidadeTotalCarrinho();
  badge.textContent = qtd;
  badge.style.display = qtd > 0 ? "flex" : "none";
}

/* Mantém o espaço da miniatura reservado mesmo sem foto (evita que o
   texto "pule" para a esquerda). IMPORTANTE: nunca usar this.src="" aqui —
   causa loop de recarregamento da página. */
function marcarFotoCarrinhoIndisponivel(img){
  img.onerror = null;
  img.style.display = "none";
  const container = img.closest(".item-carrinho");
  if(container && !container.querySelector(".foto-placeholder")){
    img.insertAdjacentHTML("afterend", '<span class="foto-placeholder">🍪</span>');
  }
}

/* ============================================================
   5. ENTREGA OU RETIRADA + ENDEREÇO (ViaCEP)
   ============================================================ */
function obterTipoEntrega(){
  const marcado = document.querySelector('input[name="tipo-entrega"]:checked');
  return marcado ? marcado.value : "retirada";
}

function salvarTipoEntrega(tipo){
  gravarStorage(CHAVE_TIPO_ENTREGA, tipo);
}

function carregarTipoEntregaSalvo(){
  const salvo = lerStorage(CHAVE_TIPO_ENTREGA, "");
  if(!salvo) return;
  const radio = $id(`tipo-entrega-${salvo}`);
  if(radio) radio.checked = true;
}

function atualizarTextoAviso(){
  const aviso = $id("aviso-obrigatorio");
  if(!aviso || aviso.classList.contains("erro")) return;
  aviso.textContent = obterTipoEntrega() === "entrega"
    ? "* Obrigatórios: nome, CEP, número e a data de cada item"
    : "* Obrigatórios: nome e a data de cada item";
}

function atualizarVisibilidadeEntrega(){
  const tipo = obterTipoEntrega();
  const avisoFrete = $id("aviso-frete");
  const avisoRetirada = $id("aviso-retirada");
  const blocoEndereco = $id("bloco-endereco");

  const ehEntrega = tipo === "entrega";

  if(avisoFrete) avisoFrete.style.display = ehEntrega ? "block" : "none";
  if(blocoEndereco) blocoEndereco.style.display = ehEntrega ? "block" : "none";

  if(avisoRetirada){
    avisoRetirada.style.display = ehEntrega ? "none" : "block";
    const textoEndereco = $id("texto-endereco-retirada");
    const linkMapa = $id("link-mapa-retirada");
    if(textoEndereco && typeof ENDERECO_RETIRADA !== "undefined"){
      textoEndereco.textContent = `Endereço para retirada: ${ENDERECO_RETIRADA}`;
    }
    if(linkMapa && typeof ENDERECO_RETIRADA !== "undefined"){
      // Link direto pro Google Maps, sem chave de API — usa o mesmo texto de
      // ENDERECO_RETIRADA, então atualiza sozinho quando você editar data.js.
      linkMapa.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ENDERECO_RETIRADA)}`;
    }
  }

  atualizarTextoAviso();

  // Realça visualmente a opção marcada (fallback para navegadores sem :has())
  document.querySelectorAll(".opcao-entrega").forEach(label => {
    const input = label.querySelector('input[name="tipo-entrega"]');
    label.classList.toggle("selecionada", !!input?.checked);
  });
}

function obterEndereco(){
  try{
    const dados = lerStorage(CHAVE_ENDERECO, "");
    return dados ? JSON.parse(dados) : {};
  }catch(e){
    return {};
  }
}

function salvarEnderecoAtual(){
  const endereco = {
    cep: $id("campo-cep")?.value || "",
    rua: $id("campo-rua")?.value || "",
    bairro: $id("campo-bairro")?.value || "",
    cidade: $id("campo-cidade")?.value || "",
    numero: $id("campo-numero")?.value || "",
    semNumero: !!$id("campo-sem-numero")?.checked,
    complemento: $id("campo-complemento")?.value || ""
  };
  gravarStorage(CHAVE_ENDERECO, JSON.stringify(endereco));
}

function carregarEnderecoSalvo(){
  const endereco = obterEndereco();
  const campoCep = $id("campo-cep");
  if(!campoCep) return;

  if(endereco.cep) campoCep.value = endereco.cep;
  if(endereco.rua) $id("campo-rua").value = endereco.rua;
  if(endereco.bairro) $id("campo-bairro").value = endereco.bairro;
  if(endereco.cidade) $id("campo-cidade").value = endereco.cidade;
  if(endereco.numero) $id("campo-numero").value = endereco.numero;
  if(endereco.complemento) $id("campo-complemento").value = endereco.complemento;

  const semNumero = $id("campo-sem-numero");
  if(semNumero){
    semNumero.checked = !!endereco.semNumero;
    aplicarEstadoSemNumero();
  }
}

function aplicarEstadoSemNumero(){
  const marcado = !!$id("campo-sem-numero")?.checked;
  const numero = $id("campo-numero");
  if(!numero) return;
  numero.disabled = marcado;
  if(marcado) numero.value = "";
}

function formatarCepDigitado(valor){
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  if(digitos.length > 5) return digitos.slice(0, 5) + "-" + digitos.slice(5);
  return digitos;
}

function limparCamposEndereco(){
  ["campo-rua", "campo-bairro", "campo-cidade"].forEach(id => {
    const el = $id(id);
    if(el) el.value = "";
  });
}

function definirStatusCep(texto, tipo){
  const statusEl = $id("cep-status");
  if(!statusEl) return;
  statusEl.textContent = texto;
  statusEl.className = "cep-status" + (tipo ? ` ${tipo}` : "");
}

function cidadeAtendida(cidadeUf){
  if(typeof CIDADES_ATENDIDAS === "undefined" || !CIDADES_ATENDIDAS.length) return true;
  const cidade = semAcento(String(cidadeUf || "").split(" - ")[0]);
  return CIDADES_ATENDIDAS.some(c => semAcento(c) === cidade);
}

/* Busca automática via ViaCEP (API pública e gratuita, sem chave).
   https://viacep.com.br */
async function buscarEnderecoPorCep(){
  const campoCep = $id("campo-cep");
  if(!campoCep) return;

  const digitos = campoCep.value.replace(/\D/g, "");

  if(digitos.length !== 8){
    limparCamposEndereco();
    definirStatusCep(digitos.length === 0 ? "" : "CEP incompleto.", digitos.length === 0 ? "" : "erro");
    return;
  }

  definirStatusCep("Buscando endereço...", "buscando");

  try{
    const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
    const dados = await resposta.json();

    // Se o cliente já mudou o CEP enquanto a busca rodava, ignora esta resposta.
    if(campoCep.value.replace(/\D/g, "") !== digitos) return;

    if(dados.erro){
      limparCamposEndereco();
      definirStatusCep("CEP não encontrado. Confira os números.", "erro");
      return;
    }

    $id("campo-rua").value = dados.logradouro || "";
    $id("campo-bairro").value = dados.bairro || "";
    $id("campo-cidade").value = [dados.localidade, dados.uf].filter(Boolean).join(" - ");

    if(cidadeAtendida($id("campo-cidade").value)){
      definirStatusCep("Endereço encontrado ✓", "sucesso");
    }else{
      definirStatusCep("Endereço encontrado. Confirme pelo WhatsApp se entregamos nessa cidade.", "aviso");
    }
    salvarEnderecoAtual();

    // Se o CEP não traz rua (ex.: CEP único de cidade pequena), o cliente
    // digita a rua à mão; senão, o próximo campo a preencher é o número.
    (dados.logradouro ? $id("campo-numero") : $id("campo-rua"))?.focus();
  }catch(erro){
    definirStatusCep("Não deu pra buscar o CEP agora. Digite a rua e o bairro manualmente.", "erro");
  }
}

/* ============================================================
   6. VALIDAÇÃO DO PEDIDO
   O botão de pedido fica sempre ativo (exceto com carrinho vazio).
   Ao clicar com algo faltando, o site mostra o que falta, leva o
   cliente até o campo e o destaca — em vez de um botão cinza mudo.
   Ordem de checagem = ordem em que os campos aparecem na tela.
   ============================================================ */
function validarPedido(){
  const itens = obterCarrinho();
  if(itens.length === 0){
    return { ok: false, mensagem: "Seu carrinho está vazio.", elemento: null };
  }

  for(const item of itens){
    const produto = PRODUTOS.find(p => p.id === item.id) || {};

    if(!item.dataEntrega){
      return { ok: false, mensagem: `Escolha a data de "${item.nome}".`, elemento: $id(`data-item-${item.id}`) };
    }
    if(produto.obs && produto.obs.obrigatoria && !item.obs.trim()){
      return { ok: false, mensagem: `Preencha as observações de "${item.nome}".`, elemento: $id(`obs-item-${item.id}`) };
    }
  }

  const nomeEl = $id("campo-nome-cliente");
  if(!nomeEl || !nomeEl.value.trim()){
    return { ok: false, mensagem: "Informe seu nome para continuar.", elemento: nomeEl };
  }

  if(obterTipoEntrega() === "entrega"){
    const cepEl = $id("campo-cep");
    const ruaEl = $id("campo-rua");
    const numeroEl = $id("campo-numero");
    const semNumero = !!$id("campo-sem-numero")?.checked;

    if((cepEl?.value || "").replace(/\D/g, "").length !== 8){
      return { ok: false, mensagem: "Informe o CEP de entrega (8 números).", elemento: cepEl };
    }
    if(!(ruaEl?.value || "").trim()){
      return { ok: false, mensagem: "Não achamos a rua. Confira o CEP ou digite a rua.", elemento: ruaEl };
    }
    if(!semNumero && !(numeroEl?.value || "").trim()){
      return { ok: false, mensagem: "Informe o número ou marque “Endereço sem número”.", elemento: numeroEl };
    }
  }

  return { ok: true };
}

function mostrarErroPedido(resultado){
  document.querySelectorAll(".campo-invalido").forEach(el => el.classList.remove("campo-invalido"));

  const aviso = $id("aviso-obrigatorio");
  if(aviso){
    aviso.textContent = `⚠️ ${resultado.mensagem}`;
    aviso.classList.add("erro");
  }

  const el = resultado.elemento;
  if(el){
    el.classList.add("campo-invalido");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
  }
}

function limparErroPedido(){
  document.querySelectorAll(".campo-invalido").forEach(el => el.classList.remove("campo-invalido"));
  const aviso = $id("aviso-obrigatorio");
  if(aviso && aviso.classList.contains("erro")){
    aviso.classList.remove("erro");
    atualizarTextoAviso();
  }
}

function atualizarEstadoBotaoPedido(){
  const btnPedido = $id("btn-fazer-pedido");
  if(btnPedido) btnPedido.disabled = obterCarrinho().length === 0;
}

/* ============================================================
   7. RENDERIZAÇÃO DO CARRINHO
   ============================================================ */
function htmlItemCarrinho(item){
  const produto = PRODUTOS.find(p => p.id === item.id) || {};
  const cfgObs = produto.obs || {};
  const placeholder = cfgObs.placeholder || "Alguma observação? (opcional)";
  const obrigatoria = !!cfgObs.obrigatoria;

  const blocoObs = item.addon ? "" : `
    <label class="obs-item-label" for="obs-item-${item.id}">
      ✏️ Observações${obrigatoria ? ' <span class="obrigatorio">*</span>' : ""}
    </label>
    <textarea id="obs-item-${item.id}" class="obs-item-input" rows="2" maxlength="${LIMITE_OBS}"
      placeholder="${escaparHTML(placeholder)}"
      oninput="atualizarObsItem(${item.id}, this.value)">${escaparHTML(item.obs)}</textarea>`;

  return `
    <div class="item-carrinho" data-item-id="${item.id}">
      <img src="${escaparHTML(item.imagem)}" alt="${escaparHTML(item.nome)}" class="foto-item-carrinho" onerror="marcarFotoCarrinhoIndisponivel(this)">
      <div class="item-info">
        <strong>${escaparHTML(item.nome)}</strong>
        <span class="preco-unit">${formatarPreco(item.preco)} un.</span>
        <div class="seletor-qtd" style="margin-top:6px;">
          <button type="button" onclick="alterarQuantidadeCarrinho(${item.id}, -1)" aria-label="Diminuir quantidade">−</button>
          <span>${item.quantidade}</span>
          <button type="button" onclick="alterarQuantidadeCarrinho(${item.id}, 1)" aria-label="Aumentar quantidade">+</button>
        </div>
        <label class="data-item-label" for="data-item-${item.id}">
          📅 Data <span class="obrigatorio">*</span>
          <input type="date" id="data-item-${item.id}" class="data-item-input" value="${item.dataEntrega || ""}" min="${obterDataISOHoje()}"
            onchange="atualizarDataItemCarrinho(${item.id}, this.value)">
        </label>
        <span class="dica-dia-item" id="dica-dia-${item.id}">${textoDicaDia(item.dataEntrega)}</span>
        ${blocoObs}
      </div>
      <button type="button" class="remover" onclick="removerDoCarrinho(${item.id})">Remover</button>
    </div>
  `;
}

function htmlSugestaoVela(itens){
  const vela = PRODUTOS.find(p => p.addonVela);
  if(!vela) return "";
  const temEncomenda = itens.some(i => i.categoria === "encomendas" && !i.addon);
  const jaTemVela = itens.some(i => i.id === vela.id);
  if(!temEncomenda || jaTemVela) return "";

  return `
    <div class="upsell-vela">
      <span>🕯️ Vai comemorar? Adicione uma vela por ${formatarPreco(vela.preco)}.</span>
      <button type="button" onclick="adicionarVelaSugerida()">Adicionar</button>
    </div>
  `;
}

function renderizarCarrinho(){
  const lista = $id("lista-carrinho");
  const totalEl = $id("carrinho-total-valor");
  const campoNome = $id("campo-nome-cliente");
  if(!lista) return;

  const itens = obterCarrinho();

  if(campoNome && !campoNome.value){
    campoNome.value = obterNomeCliente();
  }

  if(itens.length === 0){
    lista.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.<br>Adicione produtos para montar seu pedido.</p>';
  }else{
    lista.innerHTML = itens.map(htmlItemCarrinho).join("") + htmlSugestaoVela(itens);
  }

  const subtotal = totalCarrinho();
  const cupom = obterConfigCupomValido();
  const desconto = calcularDesconto(subtotal);

  const linhaSubtotal = $id("linha-subtotal");
  const linhaDesconto = $id("linha-desconto");
  const subtotalValorEl = $id("subtotal-valor");
  const descontoValorEl = $id("desconto-valor");
  const cupomCodigoEl = $id("cupom-aplicado-codigo");

  const temDescontoAtivo = !!cupom && desconto > 0;

  if(linhaSubtotal) linhaSubtotal.hidden = !temDescontoAtivo;
  if(linhaDesconto) linhaDesconto.hidden = !temDescontoAtivo;

  if(temDescontoAtivo){
    if(subtotalValorEl) subtotalValorEl.textContent = formatarPreco(subtotal);
    if(descontoValorEl) descontoValorEl.textContent = `- ${formatarPreco(desconto)}`;
    if(cupomCodigoEl) cupomCodigoEl.textContent = cupom.codigo;
  }

  // Se o código salvo não existe mais em CUPONS (ex: você removeu o cupom
  // de data.js), avisa o cliente em vez de aplicar um desconto silenciosamente.
  const cupomSalvo = obterCupomAplicado();
  const statusEl = $id("cupom-status");
  const campoCupom = $id("campo-cupom");
  if(cupomSalvo && !cupom && statusEl){
    statusEl.textContent = "Esse cupom não é mais válido.";
    statusEl.className = "cupom-status erro";
    removerCupomAplicado();
  }else if(cupom && campoCupom && !campoCupom.value){
    campoCupom.value = cupom.codigo;
    exibirCupomAplicadoNoStatus(cupom);
  }

  if(totalEl) totalEl.textContent = formatarPreco(totalComDesconto());

  atualizarEstadoBotaoPedido();
  atualizarBadgeCarrinho();
}

/* ============================================================
   8. MENSAGEM E ENVIO PARA O WHATSAPP
   ============================================================ */
function montarMensagemWhatsapp(){
  const itens = obterCarrinho();
  const nome = $id("campo-nome-cliente")?.value?.trim() || "";
  const tipoEntrega = obterTipoEntrega();
  const cep = $id("campo-cep")?.value?.trim() || "";
  const rua = $id("campo-rua")?.value?.trim() || "";
  const numero = $id("campo-numero")?.value?.trim() || "";
  const semNumero = !!$id("campo-sem-numero")?.checked;
  const complemento = $id("campo-complemento")?.value?.trim() || "";
  const bairro = $id("campo-bairro")?.value?.trim() || "";
  const cidade = $id("campo-cidade")?.value?.trim() || "";

  const linhasPedido = itens.map(i => {
    let linha = `- ${i.quantidade}x ${i.nome} (${formatarPreco(i.preco * i.quantidade)})`;
    if(i.dataEntrega){
      linha += ` — data: ${formatarDataEntregaExibicao(i.dataEntrega)} (${NOMES_DIA_CURTO[indiceDiaSemanaISO(i.dataEntrega)]})`;
    }
    if(i.obs.trim()){
      linha += `\n  Obs: ${i.obs.trim()}`;
    }
    return linha;
  }).join("\n");

  const subtotal = totalCarrinho();
  const cupom = obterConfigCupomValido();
  const desconto = calcularDesconto(subtotal);
  const totalFinal = totalComDesconto();

  let mensagem = `Olá, gostaria de pedir:\n${linhasPedido}`;

  if(cupom && desconto > 0){
    mensagem += `\n\nSubtotal: ${formatarPreco(subtotal)}`;
    mensagem += `\nCupom ${cupom.codigo} (${cupom.descricao}): -${formatarPreco(desconto)}`;
    mensagem += `\nTotal (produtos): ${formatarPreco(totalFinal)}`;
  }else{
    mensagem += `\n\nTotal (produtos): ${formatarPreco(totalFinal)}`;
  }

  if(nome){
    mensagem += `\n\nNome: ${nome}`;
  }

  if(tipoEntrega === "retirada"){
    mensagem += `\nForma de recebimento: Retirada no local`;
    if(typeof ENDERECO_RETIRADA !== "undefined"){
      mensagem += `\nEndereço para retirada: ${ENDERECO_RETIRADA}`;
    }
  }else{
    mensagem += `\nForma de recebimento: Entrega (frete a combinar à parte)`;
    if(rua || cep){
      const textoNumero = semNumero ? "s/n" : (numero ? `nº ${numero}` : "sem número informado");
      let endereco = `${rua}, ${textoNumero}`;
      if(complemento) endereco += ` (${complemento})`;
      if(bairro) endereco += ` - ${bairro}`;
      if(cidade) endereco += ` - ${cidade}`;
      if(cep) endereco += ` (CEP: ${cep})`;
      mensagem += `\nEndereço de entrega: ${endereco}`;
    }
  }

  return mensagem;
}

function enviarPedidoWhatsapp(){
  const resultado = validarPedido();
  if(!resultado.ok){
    mostrarErroPedido(resultado);
    return;
  }

  salvarNomeCliente($id("campo-nome-cliente")?.value?.trim() || "");
  salvarTipoEntrega(obterTipoEntrega());
  if(obterTipoEntrega() === "entrega"){
    salvarEnderecoAtual();
  }

  const mensagem = montarMensagemWhatsapp();
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;

  const janela = window.open(url, "_blank");
  if(janela){
    mostrarConfirmacaoEnvio();
  }else{
    // Bloqueador de pop-up impediu a nova aba: abre na mesma aba.
    window.location.href = url;
  }
}

/* Tela de "pedido enviado": evita o cliente ficar sem saber se deu certo
   (ou reenviar o mesmo pedido duas vezes) e oferece limpar o carrinho. */
function mostrarConfirmacaoEnvio(){
  const painel = $id("painel-carrinho");
  if(!painel || $id("confirmacao-envio")) return;

  const tela = document.createElement("div");
  tela.id = "confirmacao-envio";
  tela.className = "confirmacao-envio";
  tela.setAttribute("role", "dialog");
  tela.setAttribute("aria-labelledby", "confirmacao-titulo");
  tela.innerHTML = `
    <div class="confirmacao-corpo">
      <span class="confirmacao-icone" aria-hidden="true">✅</span>
      <h3 id="confirmacao-titulo">Falta só enviar!</h3>
      <p>Abrimos o WhatsApp com o seu pedido pronto. <strong>Toque em enviar por lá</strong> para a Bakeria confirmar valores, frete e disponibilidade.</p>
      <button type="button" class="btn-pedido" id="btn-novo-pedido">Já enviei — começar novo pedido</button>
      <button type="button" class="btn-secundario" id="btn-voltar-carrinho">Voltar ao carrinho</button>
    </div>
  `;
  painel.appendChild(tela);

  $id("btn-novo-pedido").addEventListener("click", () => {
    salvarCarrinho([]);
    removerCupom();
    tela.remove();
    fecharCarrinho();
  });
  $id("btn-voltar-carrinho").addEventListener("click", () => tela.remove());
  $id("btn-novo-pedido").focus();
}

/* ============================================================
   9. RODAPÉ COM CONTATO
   ============================================================ */
function renderizarRodapeContato(){
  const el = $id("rodape-contato");
  if(!el) return;

  const links = [];

  const numeroLocal = WHATSAPP_NUMERO.replace(/^55/, "");
  const ddd = numeroLocal.slice(0, 2);
  const resto = numeroLocal.slice(2);
  const formatado = `(${ddd}) ${resto.slice(0, -4)}-${resto.slice(-4)}`;
  links.push(`<a href="https://wa.me/${WHATSAPP_NUMERO}" target="_blank" rel="noopener">💬 WhatsApp ${formatado}</a>`);

  if(typeof INSTAGRAM_USUARIO !== "undefined" && INSTAGRAM_USUARIO){
    const usuario = escaparHTML(INSTAGRAM_USUARIO.replace(/^@/, ""));
    links.push(`<a href="https://instagram.com/${usuario}" target="_blank" rel="noopener">📷 @${usuario}</a>`);
  }

  if(typeof ENDERECO_RETIRADA !== "undefined"){
    const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ENDERECO_RETIRADA)}`;
    links.push(`<a href="${mapa}" target="_blank" rel="noopener">📍 ${escaparHTML(ENDERECO_RETIRADA)}</a>`);
  }

  el.innerHTML = links.join("");
}

/* ============================================================
   10. INICIALIZAÇÃO
   ============================================================ */
function iniciarCarrinho(){
  const painel = $id("painel-carrinho");
  if(painel) painel.inert = true; // fechado = fora da ordem de Tab

  carregarEnderecoSalvo();
  carregarTipoEntregaSalvo();
  atualizarVisibilidadeEntrega();
  atualizarBadgeCarrinho();
  renderizarCarrinho();
  renderizarRodapeContato();

  $id("btn-abrir-carrinho")?.addEventListener("click", () => {
    renderizarCarrinho();
    abrirCarrinho();
  });
  $id("btn-fechar-carrinho")?.addEventListener("click", fecharCarrinho);
  $id("overlay-carrinho")?.addEventListener("click", fecharCarrinho);
  $id("btn-fazer-pedido")?.addEventListener("click", enviarPedidoWhatsapp);

  $id("btn-aplicar-cupom")?.addEventListener("click", aplicarCupom);
  $id("campo-cupom")?.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
      e.preventDefault();
      aplicarCupom();
    }
  });

  // Qualquer edição no painel limpa o destaque de erro do pedido.
  painel?.addEventListener("input", limparErroPedido);
  painel?.addEventListener("change", limparErroPedido);

  $id("campo-nome-cliente")?.addEventListener("input", (e) => {
    salvarNomeCliente(e.target.value);
  });

  document.querySelectorAll('input[name="tipo-entrega"]').forEach(radio => {
    radio.addEventListener("change", () => {
      salvarTipoEntrega(obterTipoEntrega());
      atualizarVisibilidadeEntrega();
    });
  });

  const campoCep = $id("campo-cep");
  if(campoCep){
    campoCep.addEventListener("input", (e) => {
      e.target.value = formatarCepDigitado(e.target.value);
      const digitos = e.target.value.replace(/\D/g, "");
      if(digitos.length === 8){
        buscarEnderecoPorCep();
      }else{
        limparCamposEndereco();
        definirStatusCep("", "");
      }
    });
  }

  $id("campo-sem-numero")?.addEventListener("change", () => {
    aplicarEstadoSemNumero();
    salvarEnderecoAtual();
  });

  // Rua, número, bairro, cidade e complemento: o cliente pode corrigir
  // manualmente (ex: CEP genérico, endereço novo, etc.)
  ["campo-numero", "campo-rua", "campo-bairro", "campo-cidade", "campo-complemento"].forEach(id => {
    $id(id)?.addEventListener("input", salvarEnderecoAtual);
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && $id("painel-carrinho")?.classList.contains("aberto")){
      fecharCarrinho();
    }
  });
}

document.addEventListener("DOMContentLoaded", iniciarCarrinho);
