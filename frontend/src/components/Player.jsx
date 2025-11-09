import { useState, useEffect, useRef } from "react";
import "./Player.css";
import { StepBack, StepForward, Play, Pause } from "lucide-react";

const Player = ({ currentMusic }) => {
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (currentMusic && currentMusic.url) {
        audioRef.current.src = currentMusic.url;
        audioRef.current.play().catch((error) => {
          console.log("Playback prevented by browser:", error);
        });
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    }
  }, [currentMusic]); // Re-executa quando a música atual muda

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
    };

    const setAudioDuration = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // Futuramente: tocar a próxima música
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", setAudioDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", setAudioDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (event) => {
    const newTime = (event.target.value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player-container">
      <audio ref={audioRef} />
      <div className="music-info">
        {currentMusic ? (
          <>
            <span className="music-name">{currentMusic.name}</span>
            <span className="music-artist">{currentMusic.artist}</span>
          </>
        ) : (
          <span className="music-info-placeholder">Selecione uma música</span>
        )}
      </div>

      <div className="player-controls">
        <div className="main-controls">
          <button className="control-button">
            <StepBack size={22} />
          </button>
          <button
            className="control-button play-button"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button className="control-button">
            <StepForward size={22} />
          </button>
        </div>
        <div className="progress-bar-container">
          <span className="time-display">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            ref={progressBarRef}
            onChange={handleProgressChange}
            className="progress-bar"
            style={{ backgroundSize: `${progressPercentage}% 100%` }}
          />
          <span className="time-display">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="extra-controls">
        {/* Espaço para controles de volume, etc. */}
      </div>
    </div>
  );
};

export default Player;
