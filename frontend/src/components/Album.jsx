import { useState, useEffect } from "react";
import { FilePen, Trash2, DiscAlbum } from "lucide-react";

const AlbumView = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albumName, setAlbumName] = useState("");
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [albumDate, setAlbumDate] = useState("");
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const getAlbums = async () => {
    try {
      const response = await fetch("http://localhost:5000/album");
      if (response.ok) setAlbums(await response.json());
    } catch (error) {
      console.error("Falha ao buscar álbuns:", error);
    }
  };

  const getArtists = async () => {
    try {
      const response = await fetch("http://localhost:5000/artist");
      if (response.ok) setArtists(await response.json());
    } catch (error) {
      console.error("Falha ao buscar artistas:", error);
    }
  };

  useEffect(() => {
    getAlbums();
    getArtists(); // Carrega artistas para o formulário
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const handleOpenAddForm = () => {
    setEditingAlbum(null);
    setAlbumName("");
    setSelectedArtistId("");
    setAlbumDate("");
    setShowAddForm(true);
  };

  const handleOpenEditForm = (album) => {
    setEditingAlbum(album);
    setAlbumName(album.name);
    setAlbumDate(album.date.split("T")[0]); // Formata a data para YYYY-MM-DD
    setSelectedArtistId(album.id_artist);
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    if (!albumName || !selectedArtistId) {
      showNotification(
        "Por favor, preencha o nome e selecione um artista.",
        "error"
      );
      return;
    }

    const isEditing = !!editingAlbum;
    const url = isEditing
      ? `http://localhost:5000/album/${editingAlbum.id}`
      : "http://localhost:5000/album";
    const method = isEditing ? "PUT" : "POST";

    const albumData = {
      name: albumName,
      id_artist: parseInt(selectedArtistId, 10),
      date: new Date(albumDate).toISOString(),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(albumData),
      });

      if (response.ok) {
        showNotification(
          `Álbum ${isEditing ? "atualizado" : "salvo"} com sucesso!`,
          "success"
        );
        setShowAddForm(false);
        getAlbums();
      } else {
        showNotification(`Erro: ${(await response.json()).error}`, "error");
      }
    } catch (error) {
      console.error("Falha na requisição:", error);
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este álbum?")) {
      try {
        const response = await fetch(`http://localhost:5000/album/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          showNotification("Álbum deletado com sucesso!", "success");
          getAlbums();
        } else {
          showNotification(`Erro: ${(await response.json()).error}`, "error");
        }
      } catch (error) {
        console.error("Falha ao deletar:", error);
      }
    }
  };

  return (
    <div className="content">
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <div className="header">
        <h2>Álbuns</h2>
      </div>

      {showAddForm && (
        <div className="form-overlay">
          <div className="add-artist-form">
            <h2>{editingAlbum ? "Editar Álbum" : "Adicionar Álbum"}</h2>
            <input
              type="text"
              placeholder="Nome do Álbum"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
            />
            <select
              value={selectedArtistId}
              onChange={(e) => setSelectedArtistId(e.target.value)}
            >
              <option value="">Selecione um Artista</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={albumDate}
              onChange={(e) => setAlbumDate(e.target.value)}
            />
            <div className="form-buttons">
              <button onClick={() => setShowAddForm(false)}>Cancelar</button>
              <button onClick={handleSubmit}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      <div className="artist-list">
        {albums.map((album) => (
          <div className="album-item" key={album.id}>
            <div className="album-icon">
              <DiscAlbum size={48} />
            </div>
            <span className="name">{album.name}</span>
            <div className="artist-item-actions">
              <button
                className="action-button"
                onClick={() => handleOpenEditForm(album)}
              >
                <FilePen size={16} />
              </button>
              <button
                className="action-button"
                onClick={() => handleDeleteAlbum(album.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {!showAddForm && (
          <div
            className="album-item add-album-item"
            onClick={handleOpenAddForm}
          >
            <div className="plus-icon">+</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumView;
