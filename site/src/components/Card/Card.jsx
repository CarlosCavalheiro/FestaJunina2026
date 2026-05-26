import "./card.css";

function Card({ img, titulo, texto }) {
  return (
    <div className="card-infos">
      <div>
        <img  className="img-card" src={img} alt={titulo} />
      </div>

      <div className="info-card">
        <p >{titulo}</p>
        <p>{texto}</p>
      </div>
    </div>
  );
}

export default Card;