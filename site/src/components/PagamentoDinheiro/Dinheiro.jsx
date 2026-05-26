import "../PagamentoDinheiro/Dinheiro.css";

export default function Dinheiro({ item, onClose }) {
  const IdPedido =
    item?.idPedido ??
    item?.IdPedido ??
    item?.pedidoId ??
    item?.PedidoId ??
    "";

  const OverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay-pix")) {
      handleClose();
    }
  };

  const handleClose = () => {
    setTimeout(() => {
      onClose();
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <div 
      className="modal-overlay-pix" 
      onClick={OverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div className="container">
        <div className="card">
          <button className="close-modal-btn" onClick={handleClose}>
            ×
          </button>

          <div className="left">
            <div className="qr-box">
              <h2>Pagamento em Dinheiro</h2>
            </div>

            <p className="pix-key">
              Pedido #{IdPedido}
            </p>
          </div>

          <div className="right">
            <input
              type="text"
              value="Aguardando pagamento presencial..."
              disabled
              className="input-top"
            />

            <div className="upload-box">
              <span className="titulo">Instruções para pagamento:</span>

              <p className="titulo2">Vá até o Senai nesses horários: </p>
              <p>Segunda-feira: 7h30 - 11h30 (Roberto)</p>
              
              <p>12h30- 21h (Cris)</p>
              <p>Terça-Feira: 7h30 - 17h30</p>
              <p>Quarta-feira: 7h30 - 21h</p>
              <p>Quinta-feira: 7h30 - 17h30</p>
              <p>Sexta-feira: 7h30 - 17h30</p>

              <p>-Informe seu nome, email cadastrado ou número do pedido.</p>

              <p>-Após a confirmação do pagamento, seu ingresso será liberado.</p>
            </div>

            <button className="action-btn" onClick={handleClose}>
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}