# Bakeria — Medição (GA4 + Pixel da Meta + dataLayer)

GA4: **G-SH398XFQY1**. Pixel da Meta: **1374233561456097**. Tudo está centralizado em `analytics.js`.

## Arquivos
| Arquivo | O que mudou |
|---|---|
| `analytics.js` | **Novo.** GA4, dataLayer, cookies e aviso de consentimento |
| `index.html`, `produto.html` | Tag `<script src="analytics.js">` (logo após `data.js`) e link "Preferências de cookies" no rodapé |
| `cart.js` | Eventos do carrinho + correção da data (ver abaixo) |
| `main.js` | Eventos de lista, clique em produto e banner |
| `produto.js` | Evento `view_item` |

Para subir no GitHub: arraste os 6 arquivos de uma vez (como no LEIA-ME principal).

## Eventos medidos
| Evento | Quando dispara |
|---|---|
| `page_view` | Ao abrir qualquer página (na de produto já com o nome do produto no título) |
| `view_item_list` | Home carregada ou categoria filtrada |
| `select_item` | Clique no produto ou em "Ver detalhes" |
| `view_item` | Página do produto aberta |
| `add_to_cart` | "Adicionar" ou "+" no carrinho |
| `remove_from_cart` | "Remover" ou "−" no carrinho |
| `view_cart` | Cliente clica no botão 🛒 do cabeçalho |
| `begin_checkout` | Primeira vez que mexe nos dados do pedido (1x por visita) |
| `apply_coupon` | Aplica cupom (parâmetros `coupon` e `coupon_valid`) |
| `select_promotion` | Clique no botão do banner |
| `generate_lead` | Clique em "Fazer pedido pelo WhatsApp" |

⚠️ `generate_lead` mede **intenção de compra**, não venda. O site não sabe se o cliente
enviou a mensagem nem se pagou. Parâmetros do evento: `coupon`, `delivery_type`
(retirada/entrega), `loja_aberta` (sim/nao, horário de Brasília) e `discount_value`.

## Estrutura do dataLayer
```js
{
  event: "add_to_cart",
  user: {                       // ⚠️ só existe com "Aceitar"; vazios são omitidos
    user_id, event_time, event_id,
    name, last_name, phone_number, city, state, country
  },
  ecommerce: {
    currency: "BRL", value: 36,
    items: [{                   // um único array, com os dois padrões de nome
      product_id, product_name, product_category, value, currency,   // pedidos
      item_id, item_name, item_category, price, quantity             // padrão GA4
    }]
  }
}
```
- `value` do item = preço × quantidade (antes do cupom). `value` do evento no carrinho/pedido já é com cupom.
- `event_time` = Unix em segundos. `event_id` é único por evento (serve para deduplicar no futuro).
- Valores em texto puro, sem hash.

## Dados pessoais e LGPD
- **Nome, sobrenome, telefone, cidade e estado ficam só no dataLayer.** O que vai para o GA4 é
  comportamento, valores e o `user_id` anônimo. Os termos do Google proíbem enviar dados pessoais
  ao Analytics. O dataLayer fica pronto para Google Tag Manager e Google Ads. A Meta recebe esses dados
  (ver seção abaixo).
- Antes do "Aceitar": nenhum `user_id`, nenhum dado pessoal; o GA4 só recebe pings sem cookie (Consent Mode v2).
- Cookies próprios: `bk_consent_v2` (escolha, 1 ano) e `bk_uid` (identificador anônimo, ~13 meses).
  Nome e endereço continuam no `localStorage`, como o site já fazia; `analytics.js` só lê.
- **Telefone:** o carrinho não pede telefone, então `phone_number` sai vazio. Se um dia houver o campo,
  chame `Analytics.definirTelefone(valor)` quando o cliente informar.
- `country` é sempre `BR` (o site só atende no Brasil).
- Pendente do seu lado: publicar uma **política de privacidade** e linkar no aviso de cookies.

## Pixel da Meta (Facebook e Instagram)
O Pixel só é carregado **depois do "Aceitar"**. Quem recusa, ou ainda não escolheu, não envia nada à Meta.
Quem já tinha aceitado antes vê o aviso de novo, porque a finalidade mudou (o cookie agora é `bk_consent_v2`).

| Momento no site | Evento da Meta |
|---|---|
| Página aberta | `PageView` |
| Produto aberto | `ViewContent` |
| Adicionar / "+" no carrinho | `AddToCart` |
| Primeira vez que mexe nos dados do pedido | `InitiateCheckout` |
| Clique em "Fazer pedido pelo WhatsApp" | `Lead` |
| Venda **confirmada** (você registra) | `Purchase` |

- **Produtos:** cada evento leva o formato padrão da Meta (`content_ids`, `contents`, `value`, `currency`)
  e também o array `products` com `product_id`, `product_name`, `product_category`, `value`, `currency`
  (+ `quantity`).
- **Cliente:** nome, sobrenome, cidade, estado, país (e telefone, se existir) vão em texto puro, só
  normalizados (minúsculas, sem pontuação, acentos mantidos). O próprio Pixel faz o hash antes de enviar.
  O `user_id` anônimo vai como `external_id`.
- **`event_id`:** o mesmo do dataLayer vai como `eventID` (deduplicação futura com a API de Conversões).
  O `event_time` fica só no dataLayer: o Pixel do navegador não aceita esse campo.
- **Nome e cidade digitados depois:** a Meta ignora um segundo `fbq("init")`, e repeti-lo pode duplicar
  eventos. Por isso o site preenche o objeto interno do Pixel antes do `Lead`. Esse método **não é
  documentado oficialmente**; se a Meta mudar a biblioteca, o evento continua sendo enviado, só sem
  nome e cidade. Confira em Gerenciador de Eventos → Testar eventos → o evento → "Parâmetros de
  correspondência avançada". Cliente que volta já vai com os dados desde o `init`.

### Por que o clique no WhatsApp é `Lead` e não `Purchase`
O site não sabe se o pedido virou venda. Mandar `Purchase` a cada clique faria a Meta contar vendas que
podem não existir, inflar o retorno dos anúncios e otimizar para o sinal errado.
- **Venda confirmada:** `Analytics.purchase({ transaction_id: "BK-0001", value: 34.2, items: [{ id: 2, quantity: 2 }] })`
  dispara `purchase` (GA4) e `Purchase` (Meta). O mesmo `transaction_id` nunca conta duas vezes.
  Falta uma forma de chamar isso sem programar (ex: uma página de confirmação).
- **Se mesmo assim quiser `Purchase` no clique:** em `analytics.js`, troque `purchaseNoPedido: false` por `true`.

### Como testar a Meta
Extensão **Meta Pixel Helper** (Chrome) ou Gerenciador de Eventos → Testar eventos. Abra o site, clique
em Aceitar e use o carrinho. No Gerenciador devem aparecer `PageView`, `AddToCart`, `InitiateCheckout` e `Lead`.

## Como testar o GA4
1. Abra o site com `?ga_debug=1` no final (ex: `.../index.html?ga_debug=1`).
2. Console do navegador (F12): cada evento aparece como `[Analytics] nome {…}`.
3. GA4 → Admin → **DebugView**: os eventos chegam em tempo real.
4. `dataLayer` digitado no console mostra tudo que foi registrado.

## Para ver nos relatórios do GA4
Os eventos de e-commerce aparecem sozinhos em Relatórios → Monetização. Para usar os parâmetros
próprios em relatórios, cadastre em Admin → Definições personalizadas → **Dimensões personalizadas**
(escopo: Evento): `delivery_type`, `loja_aberta`, `coupon_valid`. E uma **métrica personalizada**
para `discount_value`. Só passam a contar a partir do dia do cadastro.

## Correção incluída
`obterDataISOHoje()` usava UTC: depois das 21h em Brasília a data "de hoje" já virava o dia seguinte
(data de entrega e data mínima do calendário erradas). Agora usa o horário de Brasília.

## Desligar o aviso de cookies
Em `analytics.js`: `exigirConsentimento: false`. Não recomendado sem orientação jurídica.

## Observação
`analytics.css` (se existir no repositório) não é usado: o aviso de cookies traz o próprio estilo dentro do `analytics.js`.
