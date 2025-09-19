import React, { use } from 'react'
import { useNavigate } from 'react-router-dom'
import VideoPlayer from '../HLS/HLS';

const PlayerTV = () => {
  const navigate = useNavigate();
  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,};

    let urlCod = window.location.pathname.replace("/playerTV/url/", "");
    let url = decodeURIComponent(urlCod);

    const handleKeyDown = useCallback((e) => {
        if (e.key.toLowerCase() === 'b' || e.key === 'Escape') {
            e.preventDefault();
            navigate(-1);
            return;
        }
      }, [navigate]);

      useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
      });
  return (
    <div>
      <VideoPlayer src={url} options={videoJsOptions} />
    </div>
  )
}

export default PlayerTV

  