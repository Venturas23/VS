import React, { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'; // Importe o CSS do Video.js
import Hls from 'hls.js';

const VideoPlayer = ({ src, options }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // Verifique se o player já existe para evitar duplicações
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const player = (playerRef.current = videojs(videoElement, options, () => {
        console.log('O player de vídeo está pronto!');
      }));

      // Verifique se o hls.js é suportado
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          player.play();
        });
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Suporte nativo para HLS em alguns navegadores (Safari, por exemplo)
        videoElement.src = src;
        videoElement.play();
      }
    }
  }, [options, src]);

  // Certifique-se de que o player seja destruído ao desmontar o componente
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
};

export default VideoPlayer;