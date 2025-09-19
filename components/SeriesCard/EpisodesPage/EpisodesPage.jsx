import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './EpisodesPage.css';

const EpisodesPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { seriesData } = location.state || {};

    // Estado para o índice do episódio focado
    const [focusedEpisodeIndex, setFocusedEpisodeIndex] = useState(0);

    // Ref para armazenar as referências aos elementos dos episódios
    const episodeRefs = useRef([]);

    // Extrai as chaves dos episódios para facilitar a navegação
    const episodeKeys = seriesData ? Object.keys(seriesData.episodes) : [];

    useEffect(() => {
        // Adiciona um listener para eventos de teclado
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setFocusedEpisodeIndex(prevIndex => Math.max(0, prevIndex - 1));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setFocusedEpisodeIndex(prevIndex => Math.min(episodeKeys.length - 1, prevIndex + 1));
            } else if (e.key === 'Enter' && episodeKeys.length > 0) {
                e.preventDefault();
                const episode = seriesData.episodes[episodeKeys[focusedEpisodeIndex]];
                handleEpisodeClick(episode);
            } else if (e.key === 'r'){
                e.preventDefault();
                navigate(-1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Limpa o listener ao desmontar o componente
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [focusedEpisodeIndex, episodeKeys, seriesData, navigate]);

    useEffect(() => {
        // Foca no elemento do episódio quando o índice muda
        if (episodeRefs.current[focusedEpisodeIndex]) {
            episodeRefs.current[focusedEpisodeIndex].focus();
        }
    }, [focusedEpisodeIndex]);

    if (!seriesData) {
        return <div>Nenhuma série selecionada.</div>;
    }

    const handleEpisodeClick = (episode) => {
        navigate(`/player/url/${episode.link}`);
    };

    return (
        <div className="episodes-container">
            <h1 className="series-title">{seriesData.name}</h1>
            <p className="series-overview">{seriesData.tmdb_info?.overview}</p>
            <img className='series-backdrop' src={seriesData.tmdb_info?.backdrop_path} alt="" />
            <div className="episodes-list">
                {episodeKeys.map((key, index) => {
                    const episode = seriesData.episodes[key];
                    return (
                        <div
                            key={key}
                            className={`episode-card ${index === focusedEpisodeIndex ? 'focused' : ''}`}
                            onClick={() => handleEpisodeClick(episode)}
                            // Define a ref para o elemento e tabIndex para que ele possa ser focado
                            ref={el => (episodeRefs.current[index] = el)}
                            tabIndex={0}
                        >
                            <img className='img_episode' src={episode.m3u_logo} alt="" />
                            <h2 className='title_episode'>{episode.full_name}</h2>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EpisodesPage;