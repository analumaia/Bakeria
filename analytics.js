/* ============================================================
   ANALYTICS.JS — GA4 + dataLayer (carregado em index.html e produto.html)

   O QUE ESTE ARQUIVO FAZ
   1. Instala o Google Analytics 4 (ID em ANALYTICS_CONFIG abaixo).
   2. Mantém o dataLayer no padrão GA4 (ecommerce.items) com os
      dados em texto puro, sem hash.
   3. Controla o consentimento de cookies (LGPD) com Consent Mode v2:
      sem o "Aceitar" do cliente, nenhum identificador é criado e
      nenhum dado pessoal entra no dataLayer.
   4. Instala o Pixel da Meta (ID em ANALYTICS_CONFIG.meta). O Pixel só
      é carregado DEPOIS do "Aceitar": antes disso nada vai para a Meta.

   ⚠️ REGRA IMPORTANTE: dados pessoais (nome, sobrenome, telefone,
   cidade, estado) ficam no dataLayer e vão para a META (que recebe
   os dados em texto puro e faz o hash dentro do próprio Pixel).
   Para o GA4 só seguem comportamento, valores e o user_id anônimo:
   os termos do Google proíbem enviar dados pessoais ao Analytics.

   EVENTOS DA META (mesmo momento dos eventos do GA4):
     view_item → ViewContent      add_to_cart → AddToCart
     begin_checkout → InitiateCheckout      generate_lead → Lead
   "Purchase" NÃO dispara no clique do WhatsApp (veja meta.purchaseNoPedido).
   Para registrar uma venda CONFIRMADA use Analytics.purchase({...}).

   COMO TESTAR: abra o site com ?ga_debug=1 no final do endereço.
   Os eventos aparecem no console do navegador e no DebugView do GA4
   (Admin → DebugView). Para a Meta: extensão "Meta Pixel Helper" ou
   Gerenciador de Eventos → Testar eventos.
   ============================================================ */

const ANALYTICS_CONFIG = {
  measurementId: "G-SH398XFQY1",
  moeda: "BRL",
  pais: "BR",
  // true = exibe aviso de cookies e só mede depois do "Aceitar".
  // Deixe true, a menos que o jurídico oriente diferente.
  exigirConsentimento: true,

  meta: {
    pixelId: "1374233561456097",
    // false (recomendado) = o clique em "Fazer pedido pelo WhatsApp" envia
    // só "Lead". O site NÃO sabe se o pedido virou venda; mandar "Purchase"
    // aqui registraria venda que pode não ter acontecido e distorceria o
    // retorno dos anúncios. Mude para true só se aceitar essa troca.
    purchaseNoPedido: false
  },

  // Planilha de pedidos (Google Sheets via Apps Script). Veja LEIA-ME-PLANILHA.md.
  // url   = endereço do "aplicativo da web" do Apps Script (termina em /exec).
  //         Vazio = o site funciona normalmente, só não registra na planilha.
  // token = o mesmo valor da propriedade TOKEN_SITE do script.
  planilha: {
    url: "https://script.google.com/macros/s/AKfycbw0drOdO2iQJKSNzWIpePmgHlV813BftrkikJWGTJwGAAPpVL6SkK15b4zinoDaEXIl6w/exec",
    token: "b293a2398k392e329420"
  }
};

window.Analytics = (function(){
  "use strict";

  const CFG = ANALYTICS_CONFIG;
  // "_v2": o aviso passou a incluir anúncios (Meta). Trocar o nome faz o aviso
  // aparecer de novo para quem aceitou antes, pois a finalidade mudou.
  const COOKIE_CONSENT = "bk_consent_v2";
  const COOKIE_USER = "bk_uid";
  const COOKIE_PHONE = "bk_phone";
  // Mesmas chaves usadas em cart.js
  const LS_NOME = "carrinho_nome_cliente";
  const LS_ENDERECO = "carrinho_endereco_cliente";

  const params = new URLSearchParams(window.location.search);
  const DEBUG = params.get("ga_debug") === "1";

  /* ------------------------------------------------------------
     UTILITÁRIOS (cookie e localStorage nunca quebram o site)
  ------------------------------------------------------------ */
  function lerCookie(nome){
    try{
      const m = document.cookie.match(new RegExp("(?:^|; )" + nome + "=([^;]*)"));
      return m ? decodeURIComponent(m[1]) : "";
    }catch(e){ return ""; }
  }

  function gravarCookie(nome, valor, dias){
    try{
      let c = `${nome}=${encodeURIComponent(valor)}; max-age=${Math.round(dias * 86400)}; path=/; SameSite=Lax`;
      if(window.location.protocol === "https:") c += "; Secure";
      document.cookie = c;
    }catch(e){}
  }

  function apagarCookie(nome){
    try{ document.cookie = `${nome}=; max-age=0; path=/; SameSite=Lax`; }catch(e){}
  }

  function lerLS(chave){
    try{ return localStorage.getItem(chave) || ""; }catch(e){ return ""; }
  }
  function gravarLS(chave, valor){
    try{ localStorage.setItem(chave, valor); }catch(e){}
  }
  function apagarLS(chave){
    try{ localStorage.removeItem(chave); }catch(e){}
  }

  function uuid(){
    try{
      if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
    }catch(e){}
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function arredondar(n){ return Math.round((Number(n) || 0) * 100) / 100; }

  /* ------------------------------------------------------------
     CONSENTIMENTO (LGPD)
  ------------------------------------------------------------ */
  function consentimentoAtual(){
    if(!CFG.exigirConsentimento) return "granted";
    const v = lerCookie(COOKIE_CONSENT) || lerLS(COOKIE_CONSENT);
    return (v === "granted" || v === "denied") ? v : "";
  }

  function apagarCookiesGA(){
    try{
      document.cookie.split("; ").forEach(par => {
        const nome = par.split("=")[0];
        if(nome === "_ga" || nome.indexOf("_ga_") === 0) apagarCookie(nome);
      });
    }catch(e){}
  }

  /* ------------------------------------------------------------
     IDENTIFICAÇÃO DO USUÁRIO (anônima, criada só após o "Aceitar")
  ------------------------------------------------------------ */
  function obterUserId(){
    let id = lerCookie(COOKIE_USER) || lerLS(COOKIE_USER);
    if(!id) id = uuid();
    gravarCookie(COOKIE_USER, id, 395);
    gravarLS(COOKIE_USER, id);
    return id;
  }

  function dividirNome(completo){
    const partes = String(completo || "").trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
    return { name: partes[0] || "", last_name: partes.slice(1).join(" ") };
  }

  // O campo "Cidade" do carrinho vem do ViaCEP no formato "Montes Claros - MG"
  function dividirCidade(texto){
    const t = String(texto || "").trim();
    if(!t) return { city: "", state: "" };
    const m = t.match(/^(.*?)\s*-\s*([A-Za-z]{2})$/);
    return m ? { city: m[1].trim(), state: m[2].toUpperCase() } : { city: t, state: "" };
  }

  function normalizarTelefone(valor){
    const d = String(valor || "").replace(/\D/g, "");
    if(!d) return "";
    if(d.length === 10 || d.length === 11) return "+55" + d;
    return "+" + d;
  }

  function valorCampo(id){
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  // Fontes, em ordem: o que o cliente está digitando agora → o que o
  // site já guardou no navegador (nome e endereço) → cookie de telefone.
  function perfil(){
    const { name, last_name } = dividirNome(valorCampo("campo-nome-cliente") || lerLS(LS_NOME));

    let cidadeTexto = valorCampo("campo-cidade");
    if(!cidadeTexto){
      try{ cidadeTexto = (JSON.parse(lerLS(LS_ENDERECO) || "{}").cidade) || ""; }catch(e){}
    }
    const { city, state } = dividirCidade(cidadeTexto);

    return {
      name,
      last_name,
      phone_number: normalizarTelefone(lerCookie(COOKIE_PHONE) || lerLS(COOKIE_PHONE)),
      city,
      state,
      country: CFG.pais
    };
  }

  function montarUsuario(eventId){
    const base = { event_time: Math.floor(Date.now() / 1000), event_id: eventId };
    if(consentimentoAtual() !== "granted") return base; // sem aceite: sem user_id e sem dados pessoais

    const usuario = Object.assign({ user_id: obterUserId() }, base, perfil());
    Object.keys(usuario).forEach(k => { if(usuario[k] === "" || usuario[k] == null) delete usuario[k]; });
    return usuario;
  }

  /* ------------------------------------------------------------
     PRODUTOS → itens do dataLayer
     Cada item traz os campos pedidos (product_*) e os campos
     padrão do GA4 (item_*), no mesmo array.
     value = preço unitário × quantidade (antes do cupom).
  ------------------------------------------------------------ */
  function produtoPorId(id){
    return (typeof PRODUTOS !== "undefined" ? PRODUTOS : []).find(p => p.id === Number(id));
  }

  function nomeCategoria(id){
    const c = (typeof CATEGORIAS !== "undefined" ? CATEGORIAS : []).find(c => c.id === id);
    return c ? c.nome : (id || "");
  }

  function nomeLista(listaId){
    return (!listaId || listaId === "todos") ? "Todos" : nomeCategoria(listaId);
  }

  // Aceita tanto um produto de data.js quanto um item do carrinho
  // (o item do carrinho não guarda categoria, então ela é buscada em PRODUTOS).
  function montarItem(origem, quantidade, extras){
    const p = produtoPorId(origem.id) || origem;
    const qtd = quantidade || 1;
    const preco = Number(p.preco) || 0;
    const categoria = nomeCategoria(p.categoria);

    return Object.assign({
      item_id: String(p.id),
      item_name: p.nome,
      item_category: categoria,
      price: preco,
      quantity: qtd,
      product_id: String(p.id),
      product_name: p.nome,
      product_category: categoria,
      value: arredondar(preco * qtd),
      currency: CFG.moeda
    }, extras || {});
  }

  function somaItens(itens){
    return arredondar(itens.reduce((s, i) => s + i.value, 0));
  }

  function itensDoCarrinho(){
    return obterCarrinho().map(ci => montarItem(ci, ci.quantidade));
  }

  const CAMPOS_GA4 = ["item_id", "item_name", "item_category", "price", "quantity", "item_list_id", "item_list_name", "index"];
  function paraGA4(item){
    const o = {};
    CAMPOS_GA4.forEach(k => { if(item[k] !== undefined) o[k] = item[k]; });
    return o;
  }

  function cupomExtra(){
    const c = (typeof obterConfigCupomValido === "function") ? obterConfigCupomValido() : null;
    return c ? { coupon: c.codigo } : {};
  }

  // Mesma regra de main.js (horário de Brasília), repetida aqui porque
  // main.js não é carregado em produto.html.
  function lojaAberta(){
    try{
      const partes = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Sao_Paulo", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date());
      const m = {};
      partes.forEach(p => { m[p.type] = p.value; });
      const dia = { Mon: "segunda", Tue: "terca", Wed: "quarta", Thu: "quinta", Fri: "sexta", Sat: "sabado", Sun: "domingo" }[m.weekday];
      const h = HORARIO_FUNCIONAMENTO[dia];
      if(!h) return "nao";
      const agora = parseInt(m.hour, 10) * 60 + parseInt(m.minute, 10);
      const min = s => { const [a, b] = s.split(":").map(Number); return a * 60 + b; };
      return (agora >= min(h.abre) && agora < min(h.fecha)) ? "sim" : "nao";
    }catch(e){ return ""; }
  }

  /* ------------------------------------------------------------
     ORIGEM DO CLIQUE: UTMs, fbclid/gclid e site de origem (referrer)
     - Lidos na chegada e guardados no navegador por 30 dias, só COM aceite.
       Antes da decisão ficam apenas na aba (sessionStorage); se recusar, nada é guardado.
     - "Último toque" = a visita mais recente com origem; "1º toque" = a primeira.
     - Vão para a planilha junto com o pedido (veja registrarPedido).
  ------------------------------------------------------------ */
  const UTM_CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];
  const LS_UTM_ULTIMO = "bk_utm_last";
  const LS_UTM_PRIMEIRO = "bk_utm_first";
  const SS_UTM_PENDENTE = "bk_utm_pending";
  const UTM_VALIDADE_MS = 30 * 86400000;

  function lerSS(chave){ try{ return sessionStorage.getItem(chave) || ""; }catch(e){ return ""; } }
  function gravarSS(chave, valor){ try{ sessionStorage.setItem(chave, valor); }catch(e){} }
  function apagarSS(chave){ try{ sessionStorage.removeItem(chave); }catch(e){} }
  function lerJSON(texto){ try{ return JSON.parse(texto || "null"); }catch(e){ return null; } }

  function origemDestaVisita(){
    const o = {};
    UTM_CAMPOS.forEach(k => {
      const v = params.get(k);
      if(v) o[k] = String(v).slice(0, (k === "fbclid" || k === "gclid") ? 200 : 100);
    });
    try{
      if(document.referrer){
        const host = new URL(document.referrer).hostname.replace(/^www\./, "");
        if(host && host !== window.location.hostname.replace(/^www\./, "")) o.referrer = host;
      }
    }catch(e){}
    return Object.keys(o).length ? o : null;
  }

  function guardarOrigem(o){
    const reg = Object.assign({}, o, { ts: Date.now() });
    gravarLS(LS_UTM_ULTIMO, JSON.stringify(reg));
    const primeiro = lerJSON(lerLS(LS_UTM_PRIMEIRO));
    if(!primeiro || Date.now() - primeiro.ts > UTM_VALIDADE_MS) gravarLS(LS_UTM_PRIMEIRO, JSON.stringify(reg));
  }

  function origemValida(chave){
    const reg = lerJSON(lerLS(chave));
    return (reg && Date.now() - reg.ts <= UTM_VALIDADE_MS) ? reg : null;
  }

  function textoOrigem(reg){
    if(!reg) return "direto";
    if(reg.utm_source) return [reg.utm_source, reg.utm_medium, reg.utm_campaign].filter(Boolean).join(" / ");
    if(reg.fbclid) return "meta (fbclid)";        // clique em anúncio da Meta sem UTM
    if(reg.gclid) return "google ads (gclid)";
    if(reg.referrer) return "site: " + reg.referrer;
    return "direto";
  }

  function capturarOrigem(estado){
    const o = origemDestaVisita();
    if(!o) return;
    if(estado === "granted") guardarOrigem(o);
    else if(estado === "") gravarSS(SS_UTM_PENDENTE, JSON.stringify(o));   // ainda não decidiu
  }

  function aplicarOrigemPendente(){
    const o = lerJSON(lerSS(SS_UTM_PENDENTE));
    apagarSS(SS_UTM_PENDENTE);
    if(o) guardarOrigem(o);
  }

  function apagarOrigem(){
    apagarLS(LS_UTM_ULTIMO); apagarLS(LS_UTM_PRIMEIRO); apagarSS(SS_UTM_PENDENTE);
  }

  // _fbc é criado pelo Pixel; se ainda não existir, monta no formato da Meta a partir do fbclid
  function obterFbc(){
    const c = lerCookie("_fbc");
    if(c) return c;
    const u = origemValida(LS_UTM_ULTIMO);
    return (u && u.fbclid) ? `fb.1.${u.ts}.${u.fbclid}` : "";
  }

  // Identificadores do GA4 (cookies _ga e _ga_<ID>), usados para atribuir a venda confirmada
  function idsGA(){
    const out = { ga_client_id: "", ga_session_id: "" };
    const m = lerCookie("_ga").match(/^GA\d\.\d\.(.+)$/);
    if(m) out.ga_client_id = m[1];
    const s = lerCookie("_ga_" + CFG.measurementId.replace(/^G-/, ""));
    const m2 = s.match(/^GS1\.\d\.(\d+)/) || s.match(/^GS2\.\d\.s(\d+)/);
    if(m2) out.ga_session_id = m2[1];
    return out;
  }

  /* ------------------------------------------------------------
     META PIXEL
     - Carregado só depois do "Aceitar" (e removido da lista de envio ao recusar).
     - Dados do cliente seguem em texto puro, só normalizados (minúsculas, sem
       acento); o próprio Pixel faz o hash antes de enviar.
     - O event_id do dataLayer vai como eventID (deduplicação futura).
     - Produtos seguem no formato padrão da Meta (content_ids + contents com id,
       quantity e item_price + value/currency) e, além disso, no parâmetro próprio
       "products" com os campos pedidos: product_id, product_name,
       product_category, value e currency (+ quantity), num único array.
  ------------------------------------------------------------ */
  const META_EVENTOS = {
    view_item: "ViewContent",
    add_to_cart: "AddToCart",
    begin_checkout: "InitiateCheckout",
    generate_lead: "Lead",
    purchase: "Purchase"   // só via Analytics.purchase() (venda confirmada)
  };
  let metaAtivo = false;
  let metaUltimaCorrespondencia = "";

  // Minúsculas e sem pontuação, mas MANTÉM os acentos: a Meta pede UTF-8 e o hash
  // de "joão" é diferente do de "joao", então tirar o acento piora a correspondência.
  function limparMeta(texto){
    return String(texto || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "")
      .replace(/\s+/g, " ").trim();
  }

  // Formato da Meta: minúsculas; telefone só com dígitos e DDI; cidade sem espaços;
  // estado e país com 2 letras.
  function correspondenciaMeta(){
    const p = perfil();
    const d = {
      fn: limparMeta(p.name),
      ln: limparMeta(p.last_name),
      ph: String(p.phone_number || "").replace(/\D/g, ""),
      ct: limparMeta(p.city).replace(/ /g, ""),
      st: String(p.state || "").toLowerCase(),
      country: String(p.country || "").toLowerCase(),
      external_id: obterUserId()
    };
    Object.keys(d).forEach(k => { if(!d[k]) delete d[k]; });
    return d;
  }

  function iniciarMeta(){
    if(metaAtivo || !CFG.meta || !CFG.meta.pixelId) return;
    if(consentimentoAtual() !== "granted") return;
    metaAtivo = true;

    if(window.fbq){
      window.fbq("consent", "grant");   // já carregado antes e revogado: só reativa
    }else{
      // Código padrão do Pixel da Meta
      (function(f, b, e, v, n, t, s){
        if(f.fbq) return;
        n = f.fbq = function(){ n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if(!f._fbq) f._fbq = n;
        n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
        t = b.createElement(e); t.async = true; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

      const dados = correspondenciaMeta();
      metaUltimaCorrespondencia = JSON.stringify(dados);
      window.fbq("init", CFG.meta.pixelId, dados);
    }
    window.fbq("track", "PageView", {}, { eventID: uuid() });
  }

  function pararMeta(){
    metaAtivo = false;
    if(window.fbq) window.fbq("consent", "revoke");
    apagarCookie("_fbp"); apagarCookie("_fbc");
  }

  // O cliente digita nome e cidade DEPOIS de a página abrir. NÃO se deve chamar
  // fbq("init") de novo para isso: a Meta ignora os dados do segundo init e a
  // repetição pode duplicar eventos. A alternativa é preencher o objeto interno do
  // Pixel (método não documentado oficialmente, descrito pela comunidade). Se a
  // Meta mudar a biblioteca, nada quebra: o evento segue normal, sem nome/cidade.
  function atualizarCorrespondenciaMeta(){
    const dados = correspondenciaMeta();
    const texto = JSON.stringify(dados);
    if(texto === metaUltimaCorrespondencia) return;
    try{
      const inst = window.fbq && window.fbq.instance;
      const px = inst && inst.pixelsByID && inst.pixelsByID[CFG.meta.pixelId];
      if(!px) return;   // biblioteca ainda carregando: tenta de novo no próximo evento
      px.userData = Object.assign({}, px.userData || {}, dados);
      metaUltimaCorrespondencia = texto;
    }catch(e){
      if(DEBUG) console.warn("[Analytics] Meta: não foi possível atualizar os dados do cliente", e);
    }
  }

  function enviarMeta(nome, itens, ecom, params, eventId){
    const eventoMeta = META_EVENTOS[nome];
    if(!eventoMeta || !metaActiveOk()) return;

    const dados = {};
    if(itens.length > 0){
      dados.content_type = "product";
      dados.content_ids = itens.map(i => i.product_id);
      dados.contents = itens.map(i => ({ id: i.product_id, quantity: i.quantity, item_price: i.price }));
      dados.num_items = itens.reduce((s, i) => s + i.quantity, 0);
      dados.content_name = Array.from(new Set(itens.map(i => i.product_name))).join(", ");
      dados.content_category = Array.from(new Set(itens.map(i => i.product_category))).join(", ");
      dados.products = itens.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        product_category: i.product_category,
        value: i.value,
        currency: i.currency,
        quantity: i.quantity
      }));
    }
    if(ecom.transaction_id) dados.order_id = ecom.transaction_id;
    if(typeof ecom.value === "number"){
      dados.value = ecom.value;
      dados.currency = CFG.moeda;
    }
    if(ecom.coupon) dados.coupon = ecom.coupon;
    if(nome === "generate_lead"){
      dados.delivery_type = params.delivery_type;
      dados.loja_aberta = params.loja_aberta;
      if(params.order_id) dados.order_id = params.order_id;
    }

    atualizarCorrespondenciaMeta();
    window.fbq("track", eventoMeta, dados, { eventID: eventId });

    if(nome === "generate_lead" && CFG.meta.purchaseNoPedido){
      window.fbq("track", "Purchase", dados, { eventID: eventId + "_purchase" });
    }
    if(DEBUG) console.log("[Analytics] Meta", eventoMeta, dados);
  }

  function metaActiveOk(){ return metaAtivo && !!window.fbq && !!CFG.meta; }

  /* ------------------------------------------------------------
     EMISSÃO DE EVENTOS
     - dataLayer: registro completo (inclui dados pessoais se houver aceite)
     - gtag/GA4: mesmo evento SEM dados pessoais
     - Meta Pixel: eventos padrão da Meta, só com aceite
  ------------------------------------------------------------ */
  function emitir(nome, opcoes){
    const o = opcoes || {};
    const itens = o.items || [];
    const eventId = o.eventId || uuid();

    const registro = { event: nome, user: montarUsuario(eventId) };

    const temEcommerce = itens.length > 0 || typeof o.value === "number" || !!o.ecommerce;
    if(temEcommerce){
      const ecommerce = {};
      if(itens.length > 0 || typeof o.value === "number") ecommerce.currency = CFG.moeda;
      if(typeof o.value === "number") ecommerce.value = arredondar(o.value);
      Object.assign(ecommerce, o.ecommerce || {});
      if(itens.length > 0) ecommerce.items = itens;
      registro.ecommerce = ecommerce;
      window.dataLayer.push({ ecommerce: null }); // limpa o ecommerce anterior (boa prática GA4)
    }
    Object.assign(registro, o.params || {});
    window.dataLayer.push(registro);

    // Mesmo evento para o GA4, só com campos padrão e sem dados pessoais
    const gaParams = Object.assign({}, registro.ecommerce || {}, o.params || {}, { event_id: eventId });
    if(itens.length > 0) gaParams.items = itens.map(paraGA4);
    if(DEBUG) gaParams.debug_mode = true;
    window.gtag("event", nome, gaParams);

    // Meta Pixel: um erro aqui nunca pode afetar o GA4 nem o site
    try{ enviarMeta(nome, itens, registro.ecommerce || {}, o.params || {}, eventId); }
    catch(e){ if(DEBUG) console.error("[Analytics] Meta:", e); }

    if(DEBUG) console.log("[Analytics]", nome, registro);
  }

  // Nenhum erro de medição pode quebrar o carrinho ou o catálogo.
  function seguro(fn){
    return function(){
      try{ return fn.apply(null, arguments); }
      catch(e){ if(DEBUG) console.error("[Analytics] erro:", e); }
    };
  }

  /* ------------------------------------------------------------
     EVENTOS PÚBLICOS
  ------------------------------------------------------------ */
  const api = {
    viewItemList: seguro(function(listaId, produtos){
      if(!produtos || produtos.length === 0) return;
      const ecom = { item_list_id: listaId, item_list_name: nomeLista(listaId) };
      const itens = produtos.map((p, i) => montarItem(p, 1, Object.assign({ index: i + 1 }, ecom)));
      emitir("view_item_list", { items: itens, ecommerce: ecom });
    }),

    selectItem: seguro(function(id, listaId){
      const p = produtoPorId(id);
      if(!p) return;
      const ecom = { item_list_id: listaId, item_list_name: nomeLista(listaId) };
      emitir("select_item", { items: [montarItem(p, 1, ecom)], ecommerce: ecom });
    }),

    viewItem: seguro(function(produto){
      const itens = [montarItem(produto, 1)];
      emitir("view_item", { items: itens, value: somaItens(itens) });
    }),

    addToCart: seguro(function(origem, quantidade){
      const itens = [montarItem(origem, quantidade)];
      emitir("add_to_cart", { items: itens, value: somaItens(itens) });
    }),

    removeFromCart: seguro(function(origem, quantidade){
      const itens = [montarItem(origem, quantidade)];
      emitir("remove_from_cart", { items: itens, value: somaItens(itens) });
    }),

    // value = total do carrinho já com cupom (o que o cliente vê no site)
    viewCart: seguro(function(){
      const itens = itensDoCarrinho();
      if(itens.length === 0) return;
      emitir("view_cart", { items: itens, value: totalComDesconto(), ecommerce: cupomExtra() });
    }),

    beginCheckout: seguro(function(){
      const itens = itensDoCarrinho();
      if(itens.length === 0) return;
      emitir("begin_checkout", { items: itens, value: totalComDesconto(), ecommerce: cupomExtra() });
    }),

    // Clique em "Fazer pedido pelo WhatsApp" = intenção de compra.
    // NÃO é venda confirmada (isso o site não consegue saber).
    generateLead: seguro(function(pedidoId){
      const itens = itensDoCarrinho();
      if(itens.length === 0) return;
      const extras = {
        delivery_type: obterTipoEntrega(),            // "retirada" | "entrega"
        discount_value: arredondar(calcularDesconto(totalCarrinho())),
        loja_aberta: lojaAberta()                     // "sim" | "nao" (horário de Brasília)
      };
      if(pedidoId) extras.order_id = pedidoId;        // o mesmo código que vai no WhatsApp e na planilha
      emitir("generate_lead", {
        items: itens,
        value: totalComDesconto(),
        ecommerce: cupomExtra(),
        params: extras
      });
    }),

    // Registra o pedido na planilha (Google Sheets via Apps Script).
    // O registro do pedido acontece sempre (é o seu controle de pedidos); UTMs,
    // identificadores de anúncio e cookies só vão se o cliente tiver aceitado.
    registrarPedido: seguro(function(pedidoId){
      const P = CFG.planilha;
      if(!P || !P.url || !pedidoId) return;
      const carrinho = obterCarrinho();
      if(carrinho.length === 0) return;

      const consentido = consentimentoAtual() === "granted";
      const cli = perfil();
      const subtotal = totalCarrinho();
      const desconto = calcularDesconto(subtotal);

      const payload = {
        token: P.token || "",
        pedido_id: pedidoId,
        nome: valorCampo("campo-nome-cliente") || lerLS(LS_NOME),
        cidade: cli.city,
        estado: cli.state,
        recebimento: obterTipoEntrega(),
        cupom: cupomExtra().coupon || "",
        subtotal: arredondar(subtotal),
        desconto: arredondar(desconto),
        total: arredondar(totalComDesconto()),
        loja_aberta: lojaAberta(),
        consentimento: consentido ? "sim" : "nao",
        itens: carrinho.map(ci => {
          const it = montarItem(ci, ci.quantidade);
          return {
            produto_id: it.product_id,
            produto: it.product_name,
            categoria: it.product_category,
            quantidade: ci.quantidade,
            preco_unit: it.price,
            total_item: it.value,
            data_entrega: ci.dataEntrega || ""
          };
        })
      };

      if(consentido){
        const ult = origemValida(LS_UTM_ULTIMO);
        const pri = origemValida(LS_UTM_PRIMEIRO);
        Object.assign(payload, {
          utm_source: (ult && ult.utm_source) || "",
          utm_medium: (ult && ult.utm_medium) || "",
          utm_campaign: (ult && ult.utm_campaign) || "",
          utm_content: (ult && ult.utm_content) || "",
          utm_term: (ult && ult.utm_term) || "",
          referrer: (ult && ult.referrer) || "",
          fbclid: (ult && ult.fbclid) || "",
          gclid: (ult && ult.gclid) || "",
          ultimo_toque: textoOrigem(ult),
          primeiro_toque: textoOrigem(pri),
          fbp: lerCookie("_fbp"),
          fbc: obterFbc(),
          user_id: obterUserId(),
          user_agent: String(navigator.userAgent || "").slice(0, 300),
          url: window.location.origin + window.location.pathname
        }, idsGA());
      }else{
        payload.ultimo_toque = "sem consentimento";
        payload.primeiro_toque = "sem consentimento";
      }

      // Texto simples + no-cors: evita a verificação prévia (CORS) que o Apps Script não responde.
      // O navegador não lê a resposta; o registro é confirmado olhando a planilha.
      fetch(P.url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});

      if(DEBUG){ const p = Object.assign({}, payload); delete p.token; console.log("[Analytics] planilha", p); }
    }),

    // VENDA CONFIRMADA (o site sozinho não sabe disso: use só depois de confirmar
    // o pedido/pagamento). Dispara "purchase" no GA4 e "Purchase" na Meta.
    // Exemplo:
    //   Analytics.purchase({ transaction_id: "BK-0001", value: 34.2, coupon: "BAKEANALU",
    //                        items: [{ id: 2, quantity: 2 }] })
    // O mesmo transaction_id nunca conta duas vezes (nem ao recarregar a página).
    purchase: seguro(function(pedido){
      if(!pedido || !pedido.transaction_id || !pedido.items || pedido.items.length === 0) return;
      const id = String(pedido.transaction_id);

      let jaRegistrados = [];
      try{ jaRegistrados = JSON.parse(lerLS("bk_purchases") || "[]"); }catch(e){}
      if(jaRegistrados.indexOf(id) !== -1) return;
      jaRegistrados.push(id);
      gravarLS("bk_purchases", JSON.stringify(jaRegistrados.slice(-50)));

      const itens = pedido.items.map(i => montarItem(i, i.quantity));
      const ecom = { transaction_id: id };
      if(pedido.coupon) ecom.coupon = pedido.coupon;
      emitir("purchase", {
        items: itens,
        value: typeof pedido.value === "number" ? pedido.value : somaItens(itens),
        ecommerce: ecom,
        eventId: "purchase_" + id   // fixo por pedido: deduplica com a API de Conversões no futuro
      });
    }),

    applyCoupon: seguro(function(codigo, valido){
      emitir("apply_coupon", { params: { coupon: codigo, coupon_valid: valido ? "sim" : "nao" } });
    }),

    selectPromotion: seguro(function(indice){
      const b = (typeof BANNERS !== "undefined" ? BANNERS : [])[indice];
      if(!b) return;
      emitir("select_promotion", {
        ecommerce: {
          promotion_id: "banner_" + (indice + 1),
          promotion_name: b.titulo,
          creative_name: b.imagem,
          creative_slot: "banner_" + (indice + 1)
        }
      });
    }),

    // Para quando houver um campo de telefone no carrinho:
    // Analytics.definirTelefone("(38) 99999-9999")
    definirTelefone: seguro(function(telefone){
      if(consentimentoAtual() !== "granted") return;
      gravarCookie(COOKIE_PHONE, telefone, 395);
      gravarLS(COOKIE_PHONE, telefone);
    }),

    userId: function(){
      return consentimentoAtual() === "granted" ? obterUserId() : "";
    },

    consentir: seguro(function(estado){
      const concedido = estado === "granted";
      gravarCookie(COOKIE_CONSENT, concedido ? "granted" : "denied", 365);
      gravarLS(COOKIE_CONSENT, concedido ? "granted" : "denied");
      window.gtag("consent", "update", { analytics_storage: concedido ? "granted" : "denied" });

      if(concedido){
        window.gtag("set", { user_id: obterUserId() });
        aplicarOrigemPendente();   // UTMs da chegada, que esperavam a decisão
        iniciarMeta();
      }else{
        // Retirou o consentimento: apaga o identificador, a origem e os cookies do GA e da Meta
        pararMeta();
        apagarOrigem();
        apagarCookie(COOKIE_USER); apagarLS(COOKIE_USER);
        apagarCookie(COOKIE_PHONE); apagarLS(COOKIE_PHONE);
        apagarCookiesGA();
      }
      removerBanner();
    }),

    reabrirConsentimento: seguro(function(){ mostrarBanner(); })
  };

  /* ------------------------------------------------------------
     BANNER DE COOKIES (usa as cores do site, vindas de style.css)
  ------------------------------------------------------------ */
  function removerBanner(){
    const el = document.getElementById("bk-consent");
    if(el) el.remove();
  }

  function mostrarBanner(){
    if(document.getElementById("bk-consent")) return;

    if(!document.getElementById("bk-consent-css")){
      const css = document.createElement("style");
      css.id = "bk-consent-css";
      css.textContent = `
        #bk-consent{position:fixed;left:12px;right:12px;bottom:12px;z-index:400;max-width:640px;margin:0 auto;
          background:var(--branco,#FFFDF9);color:var(--marrom-escuro,#3A2A1C);border-radius:16px;
          box-shadow:0 8px 30px rgba(58,42,28,.25);padding:16px 18px;font-family:var(--fonte-corpo,'Poppins',sans-serif);
          font-size:.82rem;line-height:1.5;display:flex;gap:14px;align-items:center;flex-wrap:wrap;
          padding-bottom:max(16px,env(safe-area-inset-bottom))}
        #bk-consent p{margin:0;flex:1 1 260px}
        #bk-consent .bk-botoes{display:flex;gap:8px;flex:0 0 auto}
        #bk-consent button{border:none;border-radius:999px;padding:10px 18px;font-weight:700;font-size:.82rem;
          font-family:inherit;cursor:pointer;min-height:40px}
        #bk-consent .bk-aceitar{background:var(--rosa,#E0709A);color:var(--branco,#FFFDF9)}
        #bk-consent .bk-recusar{background:var(--bege,#F6EFDD);color:var(--marrom-escuro,#3A2A1C)}
      `;
      document.head.appendChild(css);
    }

    const el = document.createElement("div");
    el.id = "bk-consent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Aviso de cookies");
    el.innerHTML = `
      <p>🍪 Usamos cookies e um identificador anônimo para medir o uso do site (páginas vistas, produtos e pedidos) e para medir e personalizar anúncios na Meta (Instagram e Facebook), incluindo o envio de nome e cidade quando você os informa. Você escolhe se aceita.</p>
      <div class="bk-botoes">
        <button type="button" class="bk-recusar">Recusar</button>
        <button type="button" class="bk-aceitar">Aceitar</button>
      </div>`;
    el.querySelector(".bk-aceitar").addEventListener("click", () => api.consentir("granted"));
    el.querySelector(".bk-recusar").addEventListener("click", () => api.consentir("denied"));
    document.body.appendChild(el);
  }

  /* ------------------------------------------------------------
     INICIALIZAÇÃO: dataLayer + gtag + consentimento + GA4
  ------------------------------------------------------------ */
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };

  const estadoInicial = consentimentoAtual();
  capturarOrigem(estadoInicial);
  window.gtag("consent", "default", {
    analytics_storage: estadoInicial === "granted" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });
  window.gtag("js", new Date());

  const configGA = {};
  if(DEBUG) configGA.debug_mode = true;
  if(estadoInicial === "granted") configGA.user_id = obterUserId();

  // Na página de produto o título é definido depois (por produto.js);
  // aqui já mandamos o título certo para o page_view não sair genérico.
  if(/produto/i.test(window.location.pathname)){
    const p = produtoPorId(parseInt(params.get("id"), 10));
    if(p) configGA.page_title = `${p.nome} — Bakeria`;
  }
  window.gtag("config", CFG.measurementId, configGA);

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CFG.measurementId);
  document.head.appendChild(script);

  if(estadoInicial === "granted") iniciarMeta();   // quem já aceitou: Pixel já nesta visita

  function aoCarregar(){
    if(CFG.exigirConsentimento && estadoInicial === "") mostrarBanner();
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", aoCarregar);
  else aoCarregar();

  return api;
})();
