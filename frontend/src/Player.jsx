import "./Player.css";

const Player = ({ currentMusic }) => {
  if (!currentMusic) {
    return null;
  }

  return (
    <div className="player-container">
      <div className="music-info">
        <span className="music-name">{currentMusic.name}</span>
        <span className="artist-name">{currentMusic.artist_name}</span>
      </div>
      <audio
        controls
        autoPlay
        src={currentMusic.url}
        className="audio-player"
      ></audio>
    </div>
  );
};

export default Player;
