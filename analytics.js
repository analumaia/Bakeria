/* ============================================================
   ANALYTICS.JS — GA4 + dataLayer (carregado em index.html e produto.html)

   O QUE ESTE ARQUIVO FAZ
   1. Instala o Google Analytics 4 (ID em ANALYTICS_CONFIG abaixo).
   2. Mantém o dataLayer no padrão GA4 (ecommerce.items) com os
      dados em texto puro, sem hash.
   3. Controla o consentimento de cookies (LGPD) com Consent Mode v2:
      sem o "Aceitar" do cliente, nenhum identificador é criado e
      nenhum dado pessoal entra no dataLayer.

   ⚠️ REGRA IMPORTANTE: dados pessoais (nome, sobrenome, telefone,
   cidade, estado) ficam SOMENTE no dataLayer. Para o GA4 só seguem
   comportamento, valores e o user_id anônimo. Os termos do Google
   proíbem enviar dados pessoais ao Google Analytics; o dataLayer
   fica pronto para outras ferramentas (ex: Google Tag Manager,
   Meta, Google Ads), que fazem o hash por conta própria.

   COMO TESTAR: abra o site com ?ga_debug=1 no final do endereço.
   Os eventos aparecem no console do navegador e no DebugView do GA4
   (Admin → DebugView).
   ============================================================ */

const ANALYTICS_CONFIG = {
  measurementId: "G-SH398XFQY1",
  moeda: "BRL",
  pais: "BR",
  // true = exibe aviso de cookies e só mede depois do "Aceitar".
  // Deixe true, a menos que o jurídico oriente diferente.
  exigirConsentimento: true
};

window.Analytics = (function(){
  "use strict";

  const CFG = ANALYTICS_CONFIG;
  const COOKIE_CONSENT = "bk_consent";
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
     EMISSÃO DE EVENTOS
     - dataLayer: registro completo (inclui dados pessoais se houver aceite)
     - gtag/GA4: mesmo evento SEM dados pessoais
  ------------------------------------------------------------ */
  function emitir(nome, opcoes){
    const o = opcoes || {};
    const itens = o.items || [];
    const eventId = uuid();

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
    generateLead: seguro(function(){
      const itens = itensDoCarrinho();
      if(itens.length === 0) return;
      emitir("generate_lead", {
        items: itens,
        value: totalComDesconto(),
        ecommerce: cupomExtra(),
        params: {
          delivery_type: obterTipoEntrega(),            // "retirada" | "entrega"
          discount_value: arredondar(calcularDesconto(totalCarrinho())),
          loja_aberta: lojaAberta()                     // "sim" | "nao" (horário de Brasília)
        }
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
      }else{
        // Retirou o consentimento: apaga o identificador e os cookies do GA
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
      <p>🍪 Usamos cookies e um identificador anônimo para entender como o cardápio é usado (páginas vistas, produtos e pedidos) e melhorar o site. Você escolhe se aceita.</p>
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

  function aoCarregar(){
    if(CFG.exigirConsentimento && estadoInicial === "") mostrarBanner();
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", aoCarregar);
  else aoCarregar();

  return api;
})();
