import { useState, useEffect, useRef } from "react";
import "./Player.css";
import {
  StepBack,
  StepForward,
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
} from "lucide-react";

const Player = ({ currentMusic }) => {
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1); // 1 = 100%
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

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
      audioRef.current.volume = 0;
    } else {
      // Se estava mudo, volta para 100% ou poderia ser o volume anterior.
      // Para simplificar, voltaremos para 100%.
      setVolume(1);
      audioRef.current.volume = 1;
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon = () => {
    if (volume === 0) {
      return <VolumeX size={20} />;
    }
    if (volume < 0.5) {
      return <Volume1 size={20} />;
    }
    return <Volume2 size={20} />;
  };

  return (
    <div className="player-container">
      <audio ref={audioRef} />
      <div className="music-info">
        {currentMusic ? (
          <>
            <span className="music-name">{currentMusic.name}</span>
            <span className="music-artist">{currentMusic.artist_name}</span>
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
        <div className="volume-container">
          <button className="control-button" onClick={toggleMute}>
            <VolumeIcon />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            style={{ backgroundSize: `${volume * 100}% 100%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Player;
