export default function Card({
  imagem,
  qtIngressos,
  tipoIngresso,
  status1,
  status2
}) {
  return (
    <div className="containerIngressos">
      <div className="cardIngressos">
        <div className="card-header">
          <h2>Ingresso {qtIngressos}</h2>

          <p>{tipoIngresso}</p>

          <img
            src={imagem}
            alt="qr code"
            className="qr-code"
          />

          <h1 className="status1">{status1}</h1>

          <h1 className="status2">{status2}</h1>
        </div>
      </div>
    </div>
  );
}