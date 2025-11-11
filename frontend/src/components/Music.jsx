import { useState, useEffect } from "react";
import { FilePen, Trash2, Play, Music } from "lucide-react";

const MusicView = ({ playMusic }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [musics, setMusics] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [generos, setGeneros] = useState([]); // Assumindo que você terá uma rota para gêneros

  // State for form fields
  const [musicName, setMusicName] = useState("");
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [selectedGeneroId, setSelectedGeneroId] = useState("");
  const [newGenreName, setNewGenreName] = useState("");
  const [file, setFile] = useState(null);

  const [editingMusic, setEditingMusic] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const getMusics = async () => {
    try {
      const response = await fetch("http://localhost:5000/music");
      if (response.ok) setMusics(await response.json());
    } catch (error) {
      console.error("Falha ao buscar músicas:", error);
    }
  };

  const fetchDataForForm = async () => {
    try {
      const [artistsRes, albumsRes, generosRes] = await Promise.all([
        fetch("http://localhost:5000/artist"),
        fetch("http://localhost:5000/album"),
        fetch("http://localhost:5000/genero"),
      ]);
      if (artistsRes.ok) setArtists(await artistsRes.json());
      if (albumsRes.ok) setAlbums(await albumsRes.json());
      if (generosRes.ok) setGeneros(await generosRes.json());
    } catch (error) {
      console.error("Falha ao buscar dados para o formulário:", error);
    }
  };

  useEffect(() => {
    getMusics();
    fetchDataForForm();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const resetForm = () => {
    setMusicName("");
    setSelectedArtistId("");
    setSelectedAlbumId("");
    setSelectedGeneroId("");
    setNewGenreName("");
    setFile(null);
    setEditingMusic(null);
    document.getElementById("file-input") &&
      (document.getElementById("file-input").value = "");
  };

  const handleOpenAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleOpenEditForm = (music) => {
    setEditingMusic(music);
    setMusicName(music.name);
    setSelectedArtistId(music.id_artist || "");
    setSelectedAlbumId(music.id_album || "");
    setSelectedGeneroId(music.id_genero || "");
    setFile(null);
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    const isEditing = !!editingMusic;

    if (!musicName) {
      showNotification("O nome da música é obrigatório.", "error");
      return;
    }
    if (!isEditing && !file) {
      showNotification("Selecione um arquivo de áudio.", "error");
      return;
    }

    let genreIdToSave = selectedGeneroId;

    if (selectedGeneroId === "create-new" && newGenreName) {
      try {
        const genreResponse = await fetch("http://localhost:5000/genero", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newGenreName }),
        });
        const newGenre = await genreResponse.json();
        if (genreResponse.ok) {
          genreIdToSave = newGenre.id;
          fetchDataForForm();
        } else {
          throw new Error(newGenre.error || "Falha ao criar gênero");
        }
      } catch (error) {
        showNotification(`Erro ao criar gênero: ${error.message}`, "error");
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", musicName);
    if (selectedArtistId) formData.append("id_artist", selectedArtistId);
    if (selectedAlbumId) formData.append("id_album", selectedAlbumId);
    if (genreIdToSave) formData.append("id_genero", genreIdToSave);
    if (file) formData.append("file", file);

    const url = isEditing
      ? `http://localhost:5000/music/${editingMusic.id}`
      : "http://localhost:5000/upload";
    const method = isEditing ? "PUT" : "POST";

    setUploading(true);
    try {
      const response = await fetch(url, { method, body: formData });
      const result = await response.json();

      if (response.ok) {
        showNotification(
          `Música ${isEditing ? "atualizada" : "adicionada"} com sucesso!`,
          "success"
        );
        setShowAddForm(false);
        getMusics();
      } else {
        showNotification(`Erro: ${result.error}`, "error");
      }
    } catch (error) {
      showNotification("Falha na requisição. Verifique o console.", "error");
      console.error("Erro no submit:", error);
    }
    setUploading(false);
  };

  const handleDeleteMusic = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar esta música?")) {
      try {
        const response = await fetch(`http://localhost:5000/music/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          showNotification("Música deletada com sucesso!", "success");
          getMusics();
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
        <h2>Músicas</h2>
      </div>

      {showAddForm && (
        <div className="form-overlay">
          <div className="add-artist-form">
            <h2>{editingMusic ? "Editar Música" : "Adicionar Música"}</h2>
            <input
              type="text"
              placeholder="Nome da Música"
              value={musicName}
              onChange={(e) => setMusicName(e.target.value)}
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
            <select
              value={selectedAlbumId}
              onChange={(e) => setSelectedAlbumId(e.target.value)}
            >
              <option value="">Selecione um Álbum</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.name}
                </option>
              ))}
            </select>
            <select
              value={selectedGeneroId}
              onChange={(e) => setSelectedGeneroId(e.target.value)}
            >
              <option value="">Selecione um gênero</option>
              {generos.map((genero) => (
                <option key={genero.id} value={genero.id}>
                  {genero.name}
                </option>
              ))}
              <option value="create-new">Criar novo gênero...</option>
            </select>
            {selectedGeneroId === "create-new" && (
              <input
                type="text"
                placeholder="Nome do novo gênero"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                style={{ marginTop: "10px" }}
              />
            )}
            {!editingMusic && (
              <input
                id="file-input"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                accept="audio/*"
              />
            )}
            <div className="form-buttons">
              <button onClick={() => setShowAddForm(false)}>Cancelar</button>
              <button onClick={handleSubmit} disabled={uploading}>
                {uploading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="artist-list">
        {musics.map((music) => (
          <div className="album-item" key={music.id}>
            <div className="album-icon" onClick={() => playMusic(music.id)}>
              <div className="music-icon">
                <Music size={48} />
              </div>
              <div className="play-overlay">
                <Play size={32} />
              </div>
            </div>
            <span className="name">{music.name}</span>
            <div className="artist-item-actions">
              <button
                className="action-button"
                onClick={() => handleOpenEditForm(music)}
              >
                <FilePen size={16} />
              </button>
              <button
                className="action-button"
                onClick={() => handleDeleteMusic(music.id)}
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

export default MusicView;
