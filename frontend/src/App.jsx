import { useState, useEffect } from "react";
import Player from "./components/Player";
import { Music, ListMusic, DiscAlbum, User } from "lucide-react";
import "./App.css";
import MusicView from "./components/Music";
import PlaylistView from "./components/Playlist";
import AlbumView from "./components/Album";
import ArtistView from "./components/Artist";

const App = () => {
  const [currentView, setCurrentView] = useState("musica");
  const [currentMusic, setCurrentMusic] = useState(null);

  const playMusic = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/music/${id}`, {
        method: "GET",
      });

      if (response.ok) {
        const music = await response.json();
        setCurrentMusic(music);
        console.log("Tocando música:", music);
      } else {
        const errorResult = await response.json();
        alert("Erro: " + errorResult.error);
      }
    } catch (error) {
      console.error("Erro ao tocar música:", error);
    }
  };

  return (
    <>
      <div className="app-container">
        <div className="main-view">
          <div className="nav">
            <div className="navContent">
              <button onClick={() => setCurrentView("musica")}>
                <Music />
              </button>
              <button onClick={() => setCurrentView("playlist")}>
                <ListMusic />
              </button>
              <button onClick={() => setCurrentView("album")}>
                <DiscAlbum />
              </button>
              <button onClick={() => setCurrentView("artista")}>
                <User />
              </button>
            </div>
          </div>
          <div className="main-content">
            {currentView === "musica" && <MusicView playMusic={playMusic} />}
            {currentView === "playlist" && <PlaylistView />}
            {currentView === "album" && <AlbumView />}
            {currentView === "artista" && <ArtistView />}
          </div>
        </div>
      </div>
      <Player currentMusic={currentMusic} />
    </>
  );
};

export default App;
