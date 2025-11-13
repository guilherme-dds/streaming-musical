import { useState, useEffect } from "react";
import { ListMusic, Trash2, Plus, X, ArrowLeft } from "lucide-react";
import UserManagement from "./UserManagement";
import CustomSelect from "./CustomSelect";

const Playlist = ({ playMusic }) => {
  const [playlists, setPlaylists] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  // State for playlist detail view
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [availableMusics, setAvailableMusics] = useState([]);
  const [showAddMusicModal, setShowAddMusicModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/user");
      if (response.ok) {
        const fetchedUsers = await response.json();
        setUsers(fetchedUsers);
        if (
          fetchedUsers.length > 0 &&
          !fetchedUsers.some((u) => u.id === selectedUserId)
        ) {
          const firstUserId = fetchedUsers[0].id;
          setSelectedUserId(firstUserId);
          fetchPlaylists(firstUserId);
        }
      }
    } catch (error) {
      console.error("Falha ao buscar usuários:", error);
    }
  };

  const fetchPlaylists = async (userId) => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:5000/playlist`);
      if (response.ok) {
        setPlaylists(
          (await response.json()).filter(
            (p) => p.id_user === parseInt(userId, 10)
          )
        );
      }
    } catch (error) {
      console.error("Falha ao buscar playlists:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Playlists são buscadas quando o usuário é selecionado
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchPlaylists(selectedUserId);
    } else {
      setPlaylists([]);
    }
    setSelectedPlaylist(null); // Reseta a view de detalhe ao trocar de usuário
  }, [selectedUserId]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  const handleUsersUpdate = () => {
    fetchUsers();
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      showNotification("O nome da playlist é obrigatório.", "error");
      return;
    }
    if (!selectedUserId) {
      showNotification("Selecione um usuário para criar a playlist.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPlaylistName,
          id_user: selectedUserId,
        }),
      });
      if (response.ok) {
        showNotification("Playlist criada com sucesso!", "success");
        setNewPlaylistName("");
        setShowCreateForm(false);
        fetchPlaylists(selectedUserId);
      } else {
        const error = await response.json();
        showNotification(`Erro: ${error.error}`, "error");
      }
    } catch (error) {
      showNotification("Falha ao criar playlist.", "error");
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (window.confirm("Tem certeza que deseja deletar esta playlist?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/playlist/${playlistId}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          showNotification("Playlist deletada com sucesso!", "success");
          fetchPlaylists(selectedUserId);
          setSelectedPlaylist(null);
        } else {
          const error = await response.json();
          showNotification(`Erro: ${error.error}`, "error");
        }
      } catch (error) {
        showNotification("Falha ao deletar playlist.", "error");
      }
    }
  };

  const handlePlaylistClick = async (playlist) => {
    try {
      const response = await fetch(
        `http://localhost:5000/playlist/${playlist.id}`
      );
      if (response.ok) {
        const playlistDetails = await response.json();
        setSelectedPlaylist(playlistDetails);
      } else {
        showNotification("Erro ao buscar detalhes da playlist.", "error");
      }
    } catch (error) {
      showNotification("Falha ao buscar detalhes da playlist.", "error");
    }
  };

  const handleOpenAddMusic = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/playlist/${selectedPlaylist.id}/available-musics`
      );
      if (response.ok) {
        setAvailableMusics(await response.json());
        setShowAddMusicModal(true);
      } else {
        showNotification("Erro ao buscar músicas disponíveis.", "error");
      }
    } catch (error) {
      showNotification("Falha ao buscar músicas disponíveis.", "error");
    }
  };

  const handleAddMusicToPlaylist = async (musicId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/playlist/${selectedPlaylist.id}/music`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_music: musicId }),
        }
      );
      if (response.ok) {
        showNotification("Música adicionada com sucesso!", "success");
        // Atualiza detalhes da playlist e músicas disponíveis
        handlePlaylistClick(selectedPlaylist);
        handleOpenAddMusic();
      } else {
        const error = await response.json();
        showNotification(`Erro: ${error.error}`, "error");
      }
    } catch (error) {
      showNotification("Falha ao adicionar música.", "error");
    }
  };

  const handleRemoveMusicFromPlaylist = async (musicId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/playlist/${selectedPlaylist.id}/music/${musicId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        showNotification("Música removida com sucesso!", "success");
        handlePlaylistClick(selectedPlaylist);
      } else {
        const error = await response.json();
        showNotification(`Erro: ${error.error}`, "error");
      }
    } catch (error) {
      showNotification("Falha ao remover música.", "error");
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
        <h2>Playlists</h2>
        <div className="playlist-controls">
          <CustomSelect
            options={users.map((user) => ({
              value: user.id,
              label: user.name,
            }))}
            value={selectedUserId}
            onChange={(value) => setSelectedUserId(value)}
            placeholder="Selecione um usuário"
          />
          <button onClick={() => setShowUserManagement(true)}>
            Gerenciar Usuários
          </button>
        </div>
      </div>

      {selectedPlaylist && (
        <button
          className="back-button"
          onClick={() => setSelectedPlaylist(null)}
        >
          <ArrowLeft size={16} /> Voltar para todas as playlists
        </button>
      )}

      {showUserManagement && (
        <UserManagement
          onClose={() => setShowUserManagement(false)}
          onUsersUpdate={handleUsersUpdate}
        />
      )}

      {showCreateForm && (
        <div className="form-overlay">
          <div className="add-artist-form form-popup">
            <h2>Nova Playlist</h2>
            <div className="form-content">
              <input
                type="text"
                placeholder="Nome da Playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
            </div>
            <div className="form-buttons">
              <button onClick={() => setShowCreateForm(false)}>Cancelar</button>
              <button onClick={handleCreatePlaylist} className="primary">
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddMusicModal && (
        <div className="form-overlay">
          <div className="add-music-to-playlist-popup">
            <h2>Adicionar Músicas</h2>
            <div className="music-list-popup">
              {availableMusics.length > 0 ? (
                availableMusics.map((music) => (
                  <div key={music.id} className="music-list-item">
                    <span>
                      {music.name} -{" "}
                      {music.artist_name || "Artista desconhecido"}
                    </span>
                    <button
                      className="action-button"
                      onClick={() => handleAddMusicToPlaylist(music.id)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p>Nenhuma música nova para adicionar.</p>
              )}
            </div>
            <div className="form-buttons">
              <button onClick={() => setShowAddMusicModal(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPlaylist ? (
        <div className="playlist-detail-view">
          <div className="playlist-detail-header">
            <h3>{selectedPlaylist.name}</h3>
            <div className="playlist-detail-actions">
              <button onClick={handleOpenAddMusic} className="primary">
                Adicionar Músicas
              </button>
              <button
                className="danger"
                onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
              >
                <Trash2 size={16} /> Deletar Playlist
              </button>
            </div>
          </div>
          <div className="music-list-container">
            {selectedPlaylist.musics && selectedPlaylist.musics.length > 0 ? (
              selectedPlaylist.musics.map((music) => (
                <div key={music.id} className="music-list-item-large">
                  <span
                    onClick={() => playMusic(music.id)}
                    className="music-name-playable"
                  >
                    {music.name} - {music.artist_name || "Artista desconhecido"}
                  </span>
                  <button
                    className="action-button"
                    onClick={() => handleRemoveMusicFromPlaylist(music.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p>Esta playlist está vazia. Adicione algumas músicas!</p>
            )}
          </div>
        </div>
      ) : (
        <div className="artist-list">
          {playlists.map((playlist) => (
            <div
              className="album-item"
              key={playlist.id}
              onClick={() => handlePlaylistClick(playlist)}
            >
              <div className="album-icon">
                <ListMusic size={48} />
              </div>
              <span className="name">{playlist.name}</span>
            </div>
          ))}
          {selectedUserId && !showCreateForm && (
            <div
              className="album-item add-album-item"
              onClick={() => setShowCreateForm(true)}
            >
              <div className="plus-icon">+</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Playlist;
