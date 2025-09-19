import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';

const GITHUB_MOVIES_URL = 'https://raw.githubusercontent.com/Venturas23/VenturaStudio-Repositorio/refs/heads/main/Filmes_com_TMDB.json';
const GITHUB_SERIES_URL = 'https://raw.githubusercontent.com/Venturas23/VenturaStudio-Repositorio/refs/heads/main/Series_com_TMDB.json';

const keyboardLayout = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'OK'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'space'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '←', '→', 'clear']
];

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allData, setAllData] = useState([]);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [keyboardOpen, setKeyboardOpen] = useState(true);
    const [keyboardFocus, setKeyboardFocus] = useState({ row: 0, col: 0 });

    const navigate = useNavigate();
    const resultRefs = useRef([]);
    const keyboardRefs = useRef([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [moviesRes, seriesRes] = await Promise.all([
                    fetch(GITHUB_MOVIES_URL),
                    fetch(GITHUB_SERIES_URL)
                ]);

                const moviesData = await moviesRes.json();
                const seriesData = await seriesRes.json();

                const combinedData = [
                    ...(Array.isArray(moviesData) ? moviesData.map(item => ({ ...item, type: 'movie' })) : []),
                    ...(Array.isArray(seriesData) ? seriesData.map(item => ({ ...item, type: 'series' })) : [])
                ];

                setAllData(combinedData);
            } catch (error) {
                console.error('Erro ao buscar os dados:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setResults([]);
            setFocusedIndex(0);
            return;
        }

        const filtered = allData.filter(item => {
            const name = item.name || (item.tmdb_info && item.tmdb_info.name) || '';
            return name.toLowerCase().includes(searchTerm.toLowerCase());
        });
        setResults(filtered);
        setFocusedIndex(0);
    }, [searchTerm, allData]);

    const handleKeyDown = useCallback((e) => {
        if (e.key.toLowerCase() === 'b' || e.key === 'Escape') {
            e.preventDefault();
            navigate(-1);
            return;
        }
        if (e.key.toLowerCase() === 'r') {
            e.preventDefault();
            if (keyboardOpen) {
                // Se o teclado já estiver aberto, volta para a tela inicial
                navigate(-1);
            } else {
                // Se o teclado estiver fechado, reabre-o e reseta a pesquisa
                setSearchTerm('');
                setKeyboardOpen(true);
            }
            return;
        }

        if (keyboardOpen) {
            // Navegação no teclado virtual
            const { row, col } = keyboardFocus;
            let newRow = row;
            let newCol = col;

            if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1);
            if (e.key === 'ArrowDown') newRow = Math.min(keyboardLayout.length - 1, row + 1);
            if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
            if (e.key === 'ArrowRight') newCol = Math.min(keyboardLayout[newRow].length - 1, col + 1);

            if (newRow !== row || newCol !== col) {
                setKeyboardFocus({ row: newRow, col: newCol });
            }

            if (e.key === 'Enter') {
                const key = keyboardLayout[row][col];
                if (key === '⌫') {
                    setSearchTerm(prev => prev.slice(0, -1));
                } else if (key === 'OK') {
                    setKeyboardOpen(false);
                } else if (key === 'clear') {
                    setSearchTerm('');
                }
            }
        } else {
            // Navegação nos resultados da pesquisa
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setFocusedIndex(prev => Math.max(0, prev - 1));
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setFocusedIndex(prev => Math.min(results.length - 1, prev + 1));
            } else if(e.key === 'ArrowUp') {
                e.preventDefault();
                setFocusedIndex(prev => Math.max(0, prev - 4));
            }  else if(e.key === 'ArrowDown') {
                e.preventDefault();
                setFocusedIndex(prev => Math.max(0, prev + 4));
            } else if (e.key === 'Enter' && results[focusedIndex]) {
                e.preventDefault();
                const item = results[focusedIndex];
                if (item.type === 'movie' && item.url) {
                    navigate(`/player/url/${item.url}`);
                } else if (item.type === 'series' && item.episodes) {
                    navigate('/episodes', { state: { seriesData: item } });
                }
            }
        }
    }, [keyboardOpen, keyboardFocus, focusedIndex, results, navigate, searchTerm]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    useEffect(() => {
        if (!keyboardOpen && resultRefs.current[focusedIndex]) {
            resultRefs.current[focusedIndex].focus();
        }
    }, [focusedIndex, results, keyboardOpen]);

    useEffect(() => {
        if (keyboardOpen && keyboardRefs.current[keyboardFocus.row] && keyboardRefs.current[keyboardFocus.row][keyboardFocus.col]) {
            keyboardRefs.current[keyboardFocus.row][keyboardFocus.col].focus();
        }
    }, [keyboardFocus, keyboardOpen]);

    const renderKeyboard = () => (
        <div className="virtual-keyboard">
            {keyboardLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                    {row.map((key, colIndex) => (
                        <button
                            key={key}
                            className={`keyboard-button ${keyboardFocus.row === rowIndex && keyboardFocus.col === colIndex ? 'focused' : ''}`}
                            onClick={() => {
                                if (key === '⌫') {
                                    setSearchTerm(prev => prev.slice(0, -1));
                                } else if (key === 'OK') {
                                    setKeyboardOpen(false);
                                } else if (key === 'space') {
                                    setSearchTerm(prev => prev + ' ');
                                } else if (key === 'clear') {
                                    setSearchTerm('');
                                } else {
                                    setSearchTerm(prev => prev + key);
                                }
                            }}
                            ref={el => {
                                if (!keyboardRefs.current[rowIndex]) {
                                    keyboardRefs.current[rowIndex] = [];
                                }
                                keyboardRefs.current[rowIndex][colIndex] = el;
                            }}
                        >
                            {key === 'space' ? 'Espaço' : key}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );

    return (
        <div className="search-page-container">
            <div className="search-input-container">
                <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    readOnly
                />
            </div>

            {keyboardOpen ? (
                renderKeyboard()
            ) : (
                loading ? (
                    <div className="loading-message">Carregando dados...</div>
                ) : (
                    <div className="search-results-list">
                        {results.length > 0 ? (
                            results.map((item, index) => (
                                <div
                                    key={item.tmdb_info?.tmdb_id || index}
                                    className={`search-result-item ${index === focusedIndex ? 'focused' : ''}`}
                                    onClick={() => {
                                        if (item.type === 'movie' && item.url) {
                                            navigate(`/player/url/${item.url}`);
                                        } else if (item.type === 'series' && item.episodes) {
                                            navigate('/episodes', { state: { seriesData: item } });
                                        }
                                    }}
                                    ref={el => (resultRefs.current[index] = el)}
                                    tabIndex={0}
                                >
                                    <img
                                        src={item.logo || item.tmdb_info?.poster_path || `https://placehold.co/100x150?text=${item.name}`}
                                        alt={item.name}
                                        className="search-result-image"
                                    />
                                    <div className="search-result-info">
                                        <h3>{item.name || item.tmdb_info?.name}</h3>
                                        <span className={`item-type type-${item.type}`}>{item.type === 'movie' ? 'Filme' : 'Série'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            searchTerm.trim() !== '' && <div className="no-results-message">Nenhum resultado encontrado.</div>
                        )}
                    </div>
                )
            )}
        </div>
    );
};

export default SearchPage;