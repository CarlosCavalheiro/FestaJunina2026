import "./Reserva.css";

import Api, { BLOB_QRCODES_URL } from "../../services/api";
import Modal from "../Modal/Modal";
// import { useState, useEffect } from "react";

// import { Link } from "react-router-dom";

import bloqueado from "../../assets/MeusIngressos/bloqueado.png";
import cancelado from "../../assets/MeusIngressos/cancelado.png";
import verificando from '../../assets/MeusIngressos/verificando.png';

export default function Reserva({ item }) {

  const getStatusDisplay = () => {
    if (item.pedidoIdStatus === 1) {
      return "aguardando";
    }
    if (item.pedidoIdStatus === 2) {
      return "pago";
    }
    if (item.pedidoIdStatus === 3) {
      return "cancelado";
    }
    if (item.pedidoIdStatus === 4 && item.pedidoFtComprovante) {
      return "verificando";
    }
    else {
      return "cancelado"
    }
  };

  let DescricaoPagamento = "";

  if (item.pedidoTipoPagamento === 1)
    DescricaoPagamento = "Pix";

  if (item.pedidoTipoPagamento === 2)
    DescricaoPagamento = "Dinheiro";

 return (
    <>
      <div className="ticket">
        <div className="PH">
          {(() => {
            const status = getStatusDisplay();
            switch (status) {
              case "verificando":
                return (
                  <div className="ingr verificando">
                    <img src={verificando} className="block" alt="verificando" />
                    <p className="statusPedido">Verificando Comprovante...</p>
                    <hr />
                    <div className="PHInfo">
                      <h3 className="ingrId">Ingresso {item.idIngresso}</h3>
                      <p className="ingrVT">
                        R$ {item.valor} | {item.nomeTipo}
                      </p>
                      <p className="ingrVT2">
                        Pagamento: {DescricaoPagamento}
                      </p>
                    </div>
                  </div>
                );
              
              case "aguardando":
                return (
                  <div className="ingr aguardando">
                    <img src={bloqueado} className="block" alt="bloqueado" />
                    <p className="statusPedido">Aguardando Pagamento...</p>
                    <hr />
                    <div className="PHInfo">
                      <h3 className="ingrId">Ingresso {item.idIngresso}</h3>
                      <p className="ingrVT">
                        R$ {item.valor} | {item.nomeTipo}
                      </p>
                      <p className="ingrVT2">
                        Pagamento: {DescricaoPagamento}
                      </p>
                    </div>
                  </div>
                );

              case "pago":
                return (
                  <div className="ingr pago">
                    <img
                      src={`${BLOB_QRCODES_URL}${item.idIngresso}.png`}
                      className="QRValido"
                      alt="QR Code"
                    />
                    <p className="statusPedido">Pago</p>
                    <hr />
                    <div className="PHInfo">
                      <h3 className="ingrId">Ingresso {item.idIngresso}</h3>
                      <p className="ingrVT">
                        R$ {item.valor} | {item.nomeTipo}
                      </p>
                      <p className="ingrVT2">
                        Pagamento: {DescricaoPagamento}
                      </p>
                    </div>
                  </div>
                );
              
              default:
                return (
                  <div className="ingr cancelado">
                    <img
                      src={cancelado}
                      className="IngCancelado"
                      width="200px"
                      style={{ marginTop: "-18px" }}
                      alt="cancelado"
                    />
                    <p className="statusPedido">cancelado</p>
                    <hr />
                    <div className="PHInfo">
                      <h3 className="ingrId">Ingresso {item.idIngresso}</h3>
                      <p className="ingrVT">
                        R$ {item.valor} | {item.nomeTipo}
                      </p>
                      <p className="ingrVT2">
                        Pagamento: {DescricaoPagamento}
                      </p>
                    </div>
                  </div>
                );
            }
          })()}
        </div>
      </div>
    </>
  );
}
