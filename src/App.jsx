import React from 'react'
import { Routes, Route} from 'react-router-dom'
import MovieCard from '../components/MovieCard/MovieCard'
import TVCard from '../components/TVCard/TVCard'
import Player from '../components/Player/Player.jsx'
import PlayerTV from '../components/PlayerTV/PlayerTV.jsx'
import SeriesCard from '../components/SeriesCard/SeriesCard.jsx'
import Search from '../components/Search/Search.jsx'
import EpisodesPage from '../components/SeriesCard/EpisodesPage/EpisodesPage.jsx'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<MovieCard/>}/>
        <Route path='/Series' element={<SeriesCard/>}/>
        <Route path='/Episodes' element={<EpisodesPage/>}/>
        <Route path='/Search' element={<Search/>}/>
        <Route path='/TV' element={<TVCard/>}/>
        <Route path='/playerTV/url/*' element={<PlayerTV/>}/>
        <Route path='/player/url/*' element={<Player/>}/>
      </Routes>
    </div>
  )
}

export default App
