import "./Artist.css";

const ArtistView = () => {
  return (
    <div className="content">
      <div className="header">
        <h2>Artistas</h2>
        <button>Adicionar</button>
      </div>
      <div className="artist-list">
        <div className="artist-item">
          <div className="img"></div>
          <span className="name">Nome do Artista 1</span>
        </div>
      </div>
    </div>
  );
};

export default ArtistView;
