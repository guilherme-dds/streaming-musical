import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

const UserManagement = ({ onClose, onUsersUpdate }) => {
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });

  const getUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/user");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        showNotification("Erro ao buscar usuários.", "error");
      }
    } catch (error) {
      showNotification("Falha na requisição para buscar usuários.", "error");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const handleCreateUser = async () => {
    if (!newUserName || !newUserEmail) {
      showNotification("Nome e email são obrigatórios.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newUserName, email: newUserEmail }),
      });

      if (response.ok) {
        showNotification("Usuário criado com sucesso!", "success");
        setNewUserName("");
        setNewUserEmail("");
        await getUsers();
        onUsersUpdate();
      } else {
        const error = await response.json();
        showNotification(`Erro: ${error.error}`, "error");
      }
    } catch (error) {
      showNotification("Falha ao criar usuário.", "error");
    }
  };

  const handleDeleteUser = async (id) => {
    if (
      window.confirm(
        "Tem certeza que deseja deletar este usuário? Todas as suas playlists serão perdidas."
      )
    ) {
      try {
        const response = await fetch(`http://localhost:5000/user/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          showNotification("Usuário deletado com sucesso!", "success");
          await getUsers();
          onUsersUpdate();
        } else {
          const error = await response.json();
          showNotification(`Erro: ${error.error}`, "error");
        }
      } catch (error) {
        showNotification("Falha ao deletar usuário.", "error");
      }
    }
  };

  return (
    <div className="form-overlay">
      <div className="add-artist-form form-popup">
        <h2>Gerenciar Usuários</h2>

        <div className="form-content">
          {notification.message && (
            <div
              className={`notification ${notification.type}`}
              style={{
                position: "relative",
                top: 0,
                left: 0,
                transform: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {notification.message}
            </div>
          )}

          <div className="user-add-form">
            <div className="form-content">
              <input
                type="text"
                placeholder="Nome do novo usuário"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email do novo usuário"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="user-list-popup">
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="user-list-item">
                    <span>
                      {user.name} ({user.email})
                    </span>
                    <button
                      className="action-button"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p>Nenhum usuário encontrado.</p>
              )}
            </div>
          </div>
        </div>

        <div className="form-buttons">
          <button onClick={handleCreateUser} className="primary">
            Adicionar
          </button>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
