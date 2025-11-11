import { useState, useEffect } from "react";
import { ListMusic } from "lucide-react";
import UserManagement from "./UserManagement";

const Playlist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [showUserManagement, setShowUserManagement] = useState(false);

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
          setSelectedUserId(fetchedUsers[0].id);
        }
      }
    } catch (error) {
      console.error("Falha ao buscar usuários:", error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await fetch("http://localhost:5000/playlist");
      if (response.ok) {
        setPlaylists(await response.json());
      }
    } catch (error) {
      console.error("Falha ao buscar playlists:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPlaylists();
  }, []);

  const handleUsersUpdate = () => {
    fetchUsers();
    fetchPlaylists(); // Atualiza playlists também, caso um usuário tenha sido removido
  };

  const filteredPlaylists = selectedUserId
    ? playlists.filter((p) => p.id_user === parseInt(selectedUserId, 10))
    : [];

  return (
    <div className="content">
      <div className="header">
        <h2>Playlists</h2>
        <div className="playlist-controls">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <button onClick={() => setShowUserManagement(true)}>
            Gerenciar Usuários
          </button>
        </div>
      </div>

      {showUserManagement && (
        <UserManagement
          onClose={() => setShowUserManagement(false)}
          onUsersUpdate={handleUsersUpdate}
        />
      )}

      <div className="artist-list">
        {filteredPlaylists.map((playlist) => (
          <div className="album-item" key={playlist.id}>
            <div className="album-icon">
              <ListMusic size={48} />
            </div>
            <span className="name">{playlist.name}</span>
            <small>por {playlist.user_name}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlist;
