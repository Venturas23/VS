import { useParams, Outlet, useNavigate } from 'react-router-dom'
import ReactPlayer from 'react-player'
import './Player.css'
import { useState, useEffect, useCallback } from 'react';

const Player = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  let inactivityTimer = null;
    const navigate = useNavigate();
    // Expect the URL to be passed as a route param named 'url'
    const url = window.location.pathname.replace('/player/url/', '');
    const handleLoadedData = (e) => {
        e.target.play();
    };
    const handleKeyDown = useCallback((e) => {
        if (e.key.toLowerCase() === 'r') {
            e.preventDefault();
            navigate(-1);
            return;
        }
      }, [navigate]);
      useEffect(() => {
        const video = document.querySelector('video');
        
        if (video) {
          const updateProgress = () => {
            if (video.duration){
              setCurrentTime(video.currentTime);
              setDuration(video.duration);
              setProgress(video.currentTime);
            }
          };
          video.addEventListener('timeupdate', updateProgress);
          return () => video.removeEventListener('timeupdate', updateProgress);
        }
      },[]);
      useEffect(() => {
        const handleMouseMove = () => {
          setShowControls(true);
          clearTimeout(inactivityTimer);
          inactivityTimer = setTimeout(() => {
            setShowControls(false);
          }, 3000);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          clearTimeout(inactivityTimer);
        };
      }, []);
      const handlePlayPause = () => {
        if (isPlaying){
          document.querySelector('video').pause();
        } else {
          document.querySelector('video').play();
        }
        setIsPlaying(!isPlaying);
      }
      const handleProgressChange = (e) => {
        const newProgress = parseFloat(e.target.value);
        const video = document.querySelector('video');
        video.currentTime = newProgress;
      }
      const handleTime = (time) => {
        const hour = String(Math.floor(time / 3600)).padStart(2, '0');
        const minutes = String(Math.floor(time / 60) % 60).padStart(2, '0');
        const seconds = String(Math.floor(time % 60)).padStart(1, '0');
        return `${hour}:${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }
      
      useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
      });

      //
    return (
        <div className='custom-player-container'>
            <video className='Player' src={url} onLoadedData={handleLoadedData}></video>
            <div className={`controls-overlay ${showControls ? 'show-controls' : 'hide-controls'}`}>
              <button onClick={handlePlayPause} className='play-pause-button'>
                {isPlaying ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="play-pause-icon" viewBox="0 0 16 16">
  <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
</svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="play-pause-icon" viewBox="0 0 16 16">
  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
</svg>}
              </button>
              <p className='time-media'>{handleTime(currentTime)} | {handleTime(duration)}</p>
              <div className='progress-bar-container'>
                <input className='progress-bar'
                type='range'
                min="0"
                max={duration}
                value={progress}
                onChange={handleProgressChange}/>
              </div>
            </div>
        </div>
    )
}

export default Player
