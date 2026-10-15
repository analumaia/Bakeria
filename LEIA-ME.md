# Bakeria Confeitaria Artesanal — Site de Delivery

Site estático (HTML + CSS + JavaScript puro, sem servidor). O cliente monta
o carrinho e o pedido final é enviado pelo WhatsApp.

## Estrutura de arquivos (tudo na raiz, sem pastas)
```
index.html        → página inicial
produto.html      → página de detalhe do produto
style.css         → toda a aparência do site
data.js           → ⭐ ARQUIVO QUE VOCÊ EDITA NO DIA A DIA
cart.js           → carrinho, validação, cupom, WhatsApp (não precisa mexer)
main.js           → banner, catálogo e horário na home (não precisa mexer)
produto.js        → página de um produto (não precisa mexer)
logo.png, logo-rodape.png, favicon.png, apple-touch-icon.png, mascote-cabecalho.png
[fotos de produtos e banners, soltas na raiz]
```
Não crie pastas no repositório: os arquivos referenciam uns aos outros sem
subpasta. Para publicar, arraste todos os arquivos de uma vez em
**Add file → Upload files** no GitHub e faça o commit. O GitHub Pages leva
1–2 minutos para atualizar.

## O que editar em `data.js`
| Bloco | Para quê |
|---|---|
| `ENDERECO_RETIRADA` | Endereço mostrado na retirada (e link do Google Maps) |
| `INSTAGRAM_USUARIO` | Usuário sem @ para aparecer no rodapé (vazio = esconde) |
| `CIDADES_ATENDIDAS` | Aviso se o CEP do cliente for de outra cidade (vazio = desliga) |
| `CUPONS` | Códigos de desconto (percentual ou fixo) |
| `HORARIO_FUNCIONAMENTO` | Horário de cada dia (`null` = fechado) |
| `CATEGORIAS` | Nomes e subtítulos. Categoria sem produto some do filtro |
| `BANNERS` | Banners rotativos da home |
| `PRODUTOS` | Cada produto é um bloco `{ ... }` — copie, troque o `id` e edite |
| `DESTAQUES` | Ordem de prioridade na aba "Todos" |

### Campos opcionais de um produto
- `visivelNaHome: false` → não aparece na aba "Todos" (só na própria categoria).
  Hoje usado nos bentos sem foto (ids 9, 10 e 11) e na vela. **Quando adicionar a
  foto de um bento, apague essa linha do produto.**
- `obs: { placeholder: "...", obrigatoria: true }` → texto de ajuda do campo
  "Observações" no carrinho; com `obrigatoria: true` o cliente precisa preencher
  (usado no Combo dupla, para o cliente dizer quais sabores quer).
- `addonVela: true` → marca o produto que o carrinho sugere como "vela" quando
  há uma encomenda.

## Como funciona o pedido
1. O cliente adiciona produtos (aparece um aviso rápido e o contador do carrinho
   pulsa; o carrinho só abre quando ele clica em **Carrinho** ou em **Ver carrinho**).
2. No carrinho, cada item tem sua **data** (pronta-entrega já vem com a próxima
   data de atendimento; encomenda vem em branco para escolha consciente) e um
   campo de **observações**.
3. Escolhe Retirada ou Entrega (CEP busca rua/bairro/cidade pelo ViaCEP; número
   é obrigatório, com opção "sem número"; complemento é opcional).
4. Ao clicar em **Fazer pedido pelo WhatsApp**: se algo faltar, o site mostra o
   que é, rola até o campo e o destaca em vermelho. Se estiver tudo certo, abre
   o WhatsApp com a mensagem pronta e mostra uma tela de confirmação com a opção
   de começar um novo pedido (limpa o carrinho).

Exemplo da mensagem:
```
Olá, gostaria de pedir:
- 1x Combo dupla Cookie Pies (R$ 32,00) — data: 17/10/2026 (sáb)
  Obs: 1 Chocotella + 1 Bueníssimo
- 1x Bento Cookie Brigs ao Leite (R$ 60,00) — data: 24/10/2026 (sáb)
  Obs: Parabéns Ana

Total (produtos): R$ 92,00

Nome: Maria
Forma de recebimento: Retirada no local
Endereço para retirada: Rua Ponta Porã, 13 - Bairro Sumaré - Montes Claros/MG
```

## Regras que o código aplica
- **Datas sempre no horário de Brasília**, independente do fuso do aparelho do
  cliente. Datas que já passaram são trocadas automaticamente.
- **Preço e nome vêm sempre de `data.js`.** Se você mudar um preço, quem já tem o
  produto no carrinho passa a ver o preço novo; produto removido sai do carrinho.
- **Dia sem atendimento:** o site avisa ("confirme pelo WhatsApp"), mas não
  bloqueia — encomendas podem ser combinadas fora do horário da loja.
- **Cupom** vale só sobre os produtos (o frete é combinado à parte) e nunca deixa
  o total negativo.
- **Status Aberto/Fechado** reavalia a cada minuto e, fechado, mostra quando abre
  de novo.

## Acessibilidade e celular
- Com o carrinho aberto, o fundo não rola nem recebe foco por Tab; `Esc` fecha.
- Contraste do rosa e do verde do WhatsApp ajustado para legibilidade (WCAG AA).
- Campos com 16px no celular (evita zoom automático no iPhone).
- Banner não troca sozinho para quem ativou "reduzir movimento" no aparelho.

## Fotos: cuidado com os nomes dos arquivos
O GitHub Pages diferencia maiúsculas de minúsculas, e arquivos criados no Mac
podem ter acento "decomposto", o que gera erro 404 mesmo com o nome parecendo
igual. Os nomes atuais (`bueníssimo.jpg`, `banner site.jpg`,
`Cookie tradicional.jpeg` etc.) funcionam, mas são frágeis. Se alguma foto
sumir no site publicado, renomeie para minúsculas, sem acento e sem espaço
(ex.: `buenissimo.jpg`, `banner-site.jpg`) **e** ajuste o mesmo nome em `data.js`.

## Duplicação a ter em mente
O painel do carrinho está copiado em `index.html` e `produto.html`. Se alterar
um campo do carrinho, altere nos dois arquivos.

## Pendências suas
- [ ] Fotos dos bentos Ninhotella, Chocotella e Bueníssimo (depois, apagar `visivelNaHome: false`)
- [ ] Conferir se as descrições e ingredientes dos 3 bentos acima correspondem às receitas reais
      (foram baseados nos cookie pies de mesmo sabor)
- [ ] Preencher `INSTAGRAM_USUARIO`
- [ ] Para a prévia do link no WhatsApp, descomentar `og:image` no `index.html` com o endereço
      completo de uma foto
- [ ] Decidir se haverá produtos em "Promoções" (hoje a categoria está escondida por estar vazia)
