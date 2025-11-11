import { useState, useEffect } from "react";
import { FilePen, Trash2 } from "lucide-react";
import "./Artist.css";

const ArtistView = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [artists, setArtists] = useState([]);
  const [artistName, setArtistName] = useState("");
  const [artistImageUrl, setArtistImageUrl] = useState("");
  const [editingArtist, setEditingArtist] = useState(null); // Estado para rastrear a edição
  const [notification, setNotification] = useState({ message: "", type: "" });

  const getArtists = async () => {
    try {
      const response = await fetch("http://localhost:5000/artist");
      if (response.ok) {
        const data = await response.json();
        setArtists(data);
      } else {
        console.error("Erro ao buscar artistas:", await response.json());
      }
    } catch (error) {
      console.error("Falha na requisição para buscar artistas:", error);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000); // A notificação desaparece após 3 segundos
  };

  const handleOpenEditForm = (artist) => {
    setEditingArtist(artist);
    setArtistName(artist.name);
    setArtistImageUrl(artist.image || "");
    setShowAddForm(true);
  };

  const handleOpenAddForm = () => {
    setEditingArtist(null);
    setArtistName("");
    setArtistImageUrl("");
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    if (!artistName) {
      showNotification("Por favor, preencha o nome do artista.", "error");
      return;
    }

    const isEditing = !!editingArtist;
    const url = isEditing
      ? `http://localhost:5000/artist/${editingArtist.id}`
      : "http://localhost:5000/artist";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: artistName, image: artistImageUrl }),
      });

      if (response.ok) {
        showNotification(
          `Artista ${isEditing ? "atualizado" : "salvo"} com sucesso!`,
          "success"
        );
        setShowAddForm(false); // Fecha o formulário
        setEditingArtist(null); // Limpa o estado de edição
        getArtists(); // Atualiza a lista de artistas
      } else {
        const errorResult = await response.json();
        showNotification(
          `Erro ao ${isEditing ? "atualizar" : "salvar"} artista: ` +
            errorResult.error,
          "error"
        );
      }
    } catch (error) {
      console.error("Falha na requisição para salvar artista:", error);
      showNotification(
        "Erro ao salvar artista. Verifique o console para mais detalhes.",
        "error"
      );
    }
  };

  const handleDeleteArtist = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este artista?")) {
      try {
        const response = await fetch(`http://localhost:5000/artist/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          showNotification("Artista deletado com sucesso!", "success");
          getArtists(); // Atualiza a lista
        } else {
          const errorResult = await response.json();
          showNotification(
            "Erro ao deletar artista: " + errorResult.error,
            "error"
          );
        }
      } catch (error) {
        console.error("Falha na requisição para deletar artista:", error);
        showNotification(
          "Erro ao deletar artista. Verifique o console.",
          "error"
        );
      }
    }
  };

  useEffect(() => {
    getArtists();
  }, []);

  return (
    <div className="content">
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <div className="header">
        <h2>Artistas</h2>
        {/* O botão Adicionar foi movido para a lista de artistas */}
      </div>

      {/* O pop-up do formulário é renderizado condicionalmente sobre a lista */}
      {showAddForm && (
        <div className="form-overlay">
          <div className="add-artist-form">
            <h2>{editingArtist ? "Editar Artista" : "Adicionar Artista"}</h2>
            <input
              type="text"
              placeholder="Nome"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
            />
            <input
              type="text"
              placeholder="URL da imagem"
              value={artistImageUrl}
              onChange={(e) => setArtistImageUrl(e.target.value)}
            />
            <div className="form-buttons">
              <button onClick={() => setShowAddForm(false)}>Cancelar</button>
              <button onClick={handleSubmit}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* A lista de artistas é sempre renderizada */}
      <div className="artist-list">
        {artists.map((artist) => (
          <div className="artist-item" key={artist.id}>
            <div
              className="img"
              style={{ backgroundImage: `url(${artist.image})` }}
            ></div>
            <span className="name">{artist.name}</span>
            <div className="artist-item-actions">
              <button
                className="action-button edit-button"
                onClick={() => handleOpenEditForm(artist)}
              >
                <FilePen size={16} />
              </button>
              <button
                className="action-button delete-button"
                onClick={() => handleDeleteArtist(artist.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Botão Adicionar como um item da lista */}
        {!showAddForm && (
          <div
            className="artist-item add-artist-item"
            onClick={handleOpenAddForm}
          >
            <div className="plus-icon">+</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistView;
