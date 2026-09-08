/* Substitua ou adicione estas funções em cart.js */

function atualizarVisibilidadeEntrega(){
  const tipo = obterTipoEntrega();
  const avisoFrete = document.getElementById("aviso-frete");
  const avisoRetirada = document.getElementById("aviso-retirada");
  const blocoEndereco = document.getElementById("bloco-endereco");
  const avisoObrigatorio = document.getElementById("aviso-obrigatorio");

  // Atualiza os textos do card superior estilo "Mooca Buns"
  const iconeAtual = document.getElementById("icone-tipo-atual");
  const tituloAtual = document.getElementById("titulo-tipo-atual");
  const subAtual = document.getElementById("sub-tipo-atual");

  const ehEntrega = tipo === "entrega";

  if(ehEntrega){
    if(iconeAtual) iconeAtual.textContent = "🛵";
    if(tituloAtual) tituloAtual.textContent = "Entrega em domicílio";
    if(subAtual) subAtual.textContent = "Clique para alterar";
  } else {
    if(iconeAtual) iconeAtual.textContent = "🏪";
    if(tituloAtual) tituloAtual.textContent = "Retirar no local";
    if(subAtual) subAtual.textContent = typeof ENDERECO_RETIRADA !== "undefined" ? ENDERECO_RETIRADA : "Clique para alterar";
  }

  if(avisoFrete) avisoFrete.style.display = ehEntrega ? "block" : "none";
  if(blocoEndereco) blocoEndereco.style.display = ehEntrega ? "block" : "none";

  if(avisoRetirada){
    avisoRetirada.style.display = ehEntrega ? "none" : "block";
    const textoEndereco = document.getElementById("texto-endereco-retirada");
    if(textoEndereco && typeof ENDERECO_RETIRADA !== "undefined"){
      textoEndereco.textContent = `Endereço para retirada: ${ENDERECO_RETIRADA}`;
    }
  }

  if(avisoObrigatorio){
    avisoObrigatorio.textContent = ehEntrega
      ? "* Nome e CEP são obrigatórios para fazer o pedido"
      : "* Nome é obrigatório para fazer o pedido";
  }

  // Sincroniza os radios internos caso existam
  document.querySelectorAll('input[name="modal-tipo-entrega"]').forEach(radio => {
    radio.checked = (radio.value === tipo);
  });
}

// Controle do Modal de Escolha de Entrega
function abrirModalEntrega(){
  document.getElementById("modal-entrega-overlay")?.classList.add("aberto");
}

function fecharModalEntrega(){
  document.getElementById("modal-entrega-overlay")?.classList.remove("aberto");
}

// Dentro da função iniciarCarrinho(), adicione os ouvintes de evento:
// (Certifique-se de incluir estas linhas na sua função iniciarCarrinho existente)
document.addEventListener("DOMContentLoaded", () => {
  // ... código anterior ...
  
  const btnAbrirModal = document.getElementById("btn-abrir-modal-entrega");
  const btnFecharModal = document.getElementById("btn-fechar-modal-entrega");
  const modalOverlay = document.getElementById("modal-entrega-overlay");

  btnAbrirModal?.addEventListener("click", abrirModalEntrega);
  btnFecharModal?.addEventListener("click", fecharModalEntrega);
  modalOverlay?.addEventListener("click", (e) => {
    if(e.target === modalOverlay) fecharModalEntrega();
  });

  document.querySelectorAll('.modal-opcao-item').forEach(label => {
    label.addEventListener("click", () => {
      const valor = label.dataset.valor;
      const radio = label.querySelector('input');
      if(radio) radio.checked = true;
      
      salvarTipoEntrega(valor);
      atualizarVisibilidadeEntrega();
      atualizarEstadoBotaoPedido();
      fecharModalEntrega();
    });
  });
});
