import { useState, useRef, useEffect } from "react";

const MusicView = ({ playMusic }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [musics, setMusics] = useState([]);

  const inputName = useRef();
  const inputArtist = useRef();
  const inputDate = useRef();
  const inputDuration = useRef();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const getMusics = async () => {
    try {
      const response = await fetch("http://localhost:5000/music", {
        method: "GET",
      });

      if (response.ok) {
        const result = await response.json();
        setMusics(result);
        console.log("Músicas carregadas:", result);
      } else {
        const result = await response.json();
        alert("Erro: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao carregar as musicas:", error);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Selecione um arquivo primeiro!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", inputName.current.value);
    formData.append("artist", inputArtist.current.value);
    formData.append("release_date", inputDate.current.value);
    formData.append("duration", inputDuration.current.value);

    try {
      setUploading(true);
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert("Upload feito com sucesso!");
        getMusics(); // Recarrega a lista de músicas
      } else {
        alert("Erro: " + result.error);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro no upload, veja o console.", formData);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    getMusics();
  }, []);

  return (
    <div className="view-container" style={{ gap: "40px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <h2>Upload de Música</h2>
        <input type="text" placeholder="Nome" ref={inputName} />
        <input type="text" placeholder="Artista" ref={inputArtist} />
        <input type="date" placeholder="Data de lançamento" ref={inputDate} />
        <input type="number" placeholder="Duração" ref={inputDuration} />
        <input type="file" onChange={handleFileChange} accept="audio/*" />
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{ marginLeft: "1rem" }}
        >
          {uploading ? "Enviando..." : "Enviar"}
        </button>
      </div>

      <div>
        <h2>Músicas na Playlist</h2>
        <ul>
          {musics.map((music) => (
            <li
              key={music.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                width: "300px",
              }}
            >
              <span>
                {music.name} - {music.artist}
              </span>
              <button onClick={() => playMusic(music.id)}>Tocar</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MusicView;
