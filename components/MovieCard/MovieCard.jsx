import { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './MovieCard.css';
import { Link, useNavigate } from 'react-router-dom';

const GITHUB_JSON_URL = 'https://raw.githubusercontent.com/Venturas23/VenturaStudio-Repositorio/refs/heads/main/Filmes_com_TMDB.json';

const getSlidesToShow = () => {
  const width = window.innerWidth;
  if (width < 480) return 2;
  if (width < 600) return 4;
  if (width < 1024) return 8;
  return 6;
};

const MovieCard = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState({});
  const [slidesToShow, setSlidesToShow] = useState(getSlidesToShow());
  const [categories, setCategories] = useState([]);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const [fade, setFade] = useState(true);


  // --- NOVOS ESTADOS PARA NAVEGAÇÃO ---
  const [isNavigatingSidebar, setIsNavigatingSidebar] = useState(false);
  const [sidebarFocusIndex, setSidebarFocusIndex] = useState(0);

  const navigate = useNavigate();
  const sidebarRefs = useRef([]);

  // Lista de itens da barra lateral para facilitar a navegação
  const sidebarItems = [
      { title: "Pesquisa", path: "/Search", icon: <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="icon-bar" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg> },
      { title: "TV", path: "/TV", icon: <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="icon-bar" viewBox="0 0 16 16"><path d="M2.5 13.5A.5.5 0 0 1 3 13h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5M13.991 3l.024.001a1.5 1.5 0 0 1 .538.143.76.76 0 0 1 .302.254c.067.1.145.277.145.602v5.991l-.001.024a1.5 1.5 0 0 1-.143.538.76.76 0 0 1-.254.302c-.1.067-.277.145-.602.145H2.009l-.024-.001a1.5 1.5 0 0 1-.538-.143.76.76 0 0 1-.302.254C1.078 10.502 1 10.325 1 10V4.009l.001-.024a1.5 1.5 0 0 1 .143-.538.76.76 0 0 1 .254-.302C1.498 3.078 1.675 3 2 3zM14 2H2C0 2 0 4 0 4v6c0 2 2 2 2 2h12c2 0 2-2 2-2V4c0-2-2-2-2-2"/></svg> },
      { title: "Filmes", path: "/", icon: <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="icon-bar" viewBox="0 0 16 16"><path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm4 0v6h8V1zm8 8H4v6h8zM1 1v2h2V1zm2 3H1v2h2zM1 7v2h2V7zm2 3H1v2h2zm-2 3v2h2v-2zM15 1h-2v2h2zm-2 3v2h2V4zm2 3h-2v2h2zm-2 3v2h2v-2zm2 3h-2v2h2z"/></svg> },
      { title: "Séries", path: "/Series", icon: <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="icon-bar" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/></svg> }
  ];

  useEffect(() => {
    let isMounted = true;
    fetch(GITHUB_JSON_URL)
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        if (isMounted) {
          setMovies(Array.isArray(data) ? data : []);
          const cats = Array.from(new Set(data.map(m => m.category))).filter(Boolean);
          setCategories(cats);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar JSON:', error);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Quando a categoria muda, faz o fade-out e fade-in
  useEffect(() => {
    setFade(false);
    const timer = setTimeout(() => setFade(true), 250); // duração igual à animação CSS
    return () => clearTimeout(timer);
  }, [activeCategoryIdx]);

  useEffect(() => {
    const handleResize = () => setSlidesToShow(getSlidesToShow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isNavigatingSidebar && categories[activeCategoryIdx]) {
      setActiveSlide(slide => ({ ...slide, [categories[activeCategoryIdx]]: 0 }));
      setTimeout(() => {
        const firstSlide = document.querySelector(`.SliderMovieCard [data-index="0"] .movie-card`);
        if (firstSlide) {
          firstSlide.focus();
        }
      }, 100);
    }
  }, [activeCategoryIdx, categories, isNavigatingSidebar]);

  const sliderSettings = (category) => ({
  dots: false,
  infinite: true,
  speed: 250,
  slidesToShow,
  slidesToScroll: 1,
  arrows: false,
  lazyLoad: 'ondemand',
  accessibility: true,
  focusOnSelect: true, // Mantenha esta linha para permitir a seleção
  beforeChange: (_, newIndex) =>
    setActiveSlide((prev) => ({ ...prev, [category]: newIndex })),
});

  // **DECLARAÇÃO DE VARIÁVEIS MOVIDA PARA CIMA**
  const focusedCategory = categories[activeCategoryIdx];
  const focusedMovies = movies.filter(item => item.category === focusedCategory);
  const focusedMovieIdx = activeSlide[focusedCategory] || 0;
  const focusedMovie = focusedMovies[focusedMovieIdx];

  // **MANIPULADOR DE TECLADO UNIFICADO**
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alterna o modo de navegação com a tecla 'R'
      if (e.key.toLowerCase() === 'r') {
        setIsNavigatingSidebar(prev => !prev);
        return;
      }

      if (isNavigatingSidebar) {
        // Navegação da BARRA LATERAL
        e.preventDefault(); // Impede o scroll da página com as setas
        if (e.key === 'ArrowUp') {
          setSidebarFocusIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'ArrowDown') {
          setSidebarFocusIndex(prev => (prev < sidebarItems.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'Enter') {
          const targetPath = sidebarItems[sidebarFocusIndex].path;
          if (targetPath) {
            navigate(targetPath);
          }
        }
      } else {
        // Navegação do CARROSSEL
        if (e.key === 'ArrowUp') {
          setActiveCategoryIdx(idx => Math.max(0, idx - 1));
        } else if (e.key === 'ArrowDown') {
          setActiveCategoryIdx(idx => Math.min(categories.length - 1, idx + 1));
        } else if (e.key === 'Enter') {
          if (focusedMovie && focusedMovie.url) {
            navigate(`/player/url/${focusedMovie.url}`);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNavigatingSidebar, sidebarFocusIndex, activeCategoryIdx, categories, focusedMovie, navigate]);


  return (
    <div>
      <div className='BarLateral'>
          {sidebarItems.map((item, index) => (
              <abbr title={item.title} key={item.title} className='sidebar-item'>
                  <Link
                      to={item.path}
                      ref={el => (sidebarRefs.current[index] = el)}
                      className={isNavigatingSidebar && sidebarFocusIndex === index ? 'sidebar-focused' : 'sidebar-item'}
                  >
                      {item.icon}
                  </Link>
              </abbr>
          ))}
      </div>
      
      <div className='viwer_background'>
        <div className='viwer_background_info'>
          {focusedMovie ? (
            <div className="focused-movie-info">
              <h2 className='name_movie'>{focusedMovie.name}</h2>
              {focusedMovie.tmdb_info && focusedMovie.tmdb_info.overview && (
                <p className='movie_description'>{focusedMovie.tmdb_info.overview}</p>
              )}
              {focusedMovie.logo && (
                <img
                  src={
                    (focusedMovie.tmdb_info && focusedMovie.tmdb_info.backdrop_path)
                    || focusedMovie.logo
                    || `https://placehold.co/600x400?text=${focusedMovie.name}`
                  }
                  alt={focusedMovie.name}
                  className="backdrop-image"
                  loading="lazy"
                />
              )}
            </div>
          ) : (
            <div></div> // Evita mostrar 'Carregando' no fundo
          )}
        </div>
      </div>

      <div className="category-selector">
        {categories.map((cat, idx) => (
          <div
            key={cat}
            className={`category-item${idx === activeCategoryIdx && !isNavigatingSidebar ? ' active-category' : ''}`}
            tabIndex={-1}
            onClick={() => setActiveCategoryIdx(idx)}
          >
            {cat}
          </div>
        ))}
      </div>
        <div className='category-description-movie'>
          {categories[activeCategoryIdx] || ''}
        </div>
      <div className='carrousel-all'>
        
        <div className={`slider-container-movie fade-transition${fade ? ' fade-in' : ' fade-out'}`}>
          {loading ? (
            <div className="movie-card-loading">Carregando...</div>
          ) : (
            categories.map((cat, idx) =>
              idx === activeCategoryIdx ? (
                <Slider
                  key={cat}
                  {...sliderSettings(cat)}
                  className='SliderMovieCard'
                >
                  {movies
                  .filter(item => item.category === cat)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="movie-card-container"
                      tabIndex={-1}
                    >
                      <div
                        className={`movie-card ${!isNavigatingSidebar && index === (activeSlide[cat] || 0) ? ' movie-card-focused' : ''}`}
                        tabIndex={0}
                      >
                          {item.logo && (
                            <img
                              src={item.logo}
                              alt={item.name}
                              className="movie-card-image"
                              loading="lazy"
                            />
                          )}
                      </div>
                    </div>
                  ))}
                </Slider>
              ) : null
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
