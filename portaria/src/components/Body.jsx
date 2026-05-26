import LeitorQR from "./LeitorQR";

function Body() {
  return (
    <main className="container">
      <div className="card">
        <div className="card-header">
          <h1>Portal do Arraiá</h1>
          <p>Aproxime seu convite para validação</p>
        </div>

        <div className="card-body" style={{ padding: "2vh" }}>
          <LeitorQR />
        </div>

        <footer className="card-footer">
          <p className="status" style={{ fontSize: "1.8vh" }}>
            Aguardando leitura...
          </p>
        </footer>
      </div>
    </main>
  );
}

export default Body;