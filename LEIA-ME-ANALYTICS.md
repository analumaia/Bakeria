# Bakeria — Medição (GA4 + dataLayer)

ID de medição instalado: **G-SH398XFQY1**. Tudo está centralizado em `analytics.js`.

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
  ao Analytics. O dataLayer fica pronto para Google Tag Manager, Meta e Google Ads, que fazem o hash.
- Antes do "Aceitar": nenhum `user_id`, nenhum dado pessoal; o GA4 só recebe pings sem cookie (Consent Mode v2).
- Cookies próprios: `bk_consent` (escolha, 1 ano) e `bk_uid` (identificador anônimo, ~13 meses).
  Nome e endereço continuam no `localStorage`, como o site já fazia; `analytics.js` só lê.
- **Telefone:** o carrinho não pede telefone, então `phone_number` sai vazio. Se um dia houver o campo,
  chame `Analytics.definirTelefone(valor)` quando o cliente informar.
- `country` é sempre `BR` (o site só atende no Brasil).
- Pendente do seu lado: publicar uma **política de privacidade** e linkar no aviso de cookies.

## Como testar
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
