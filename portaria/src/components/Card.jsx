export default function Card({
  qtIngressos,
  tipoIngresso,
  status1,
  status2,
  usuarioQueLeu,
}) {
  return (
    <div className="containerIngressos">
      <div className="cardIngressos">
        <div className="card-header">
          <span className="card-ingresso-id">Ingresso #{qtIngressos}</span>

          <h2>{tipoIngresso}</h2>

          <h1 className="status1">{status1}</h1>

          <p className="card-label">Data e horário da entrada</p>
          <p className="status2">{status2}</p>

          {usuarioQueLeu && (
            <p className="card-leitor">Lido pelo usuário #{usuarioQueLeu}</p>
          )}
        </div>
      </div>
    </div>
  );
}
