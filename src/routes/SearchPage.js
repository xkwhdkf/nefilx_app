import useDebounce from 'hooks/useDebounce';
import axios from '../api/axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import 'styles/searchpage.css'

function SearchPage() {
  const [searchResults,setSearchResults] = useState([]);
  const navigate = useNavigate();

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }
  let query = useQuery();
  const searchTerm = query.get('q');  
  // q= 값을 가져옴.
  const debounceSearchTerm = useDebounce(searchTerm,500)

  useEffect(() =>{
    if(debounceSearchTerm !==""){
      fetchSearchMovie(debounceSearchTerm);
    }
  },[debounceSearchTerm]); // q값이 변할때 마다 결과값을 가져옴. 

  const fetchSearchMovie = async(searchTerm) =>{
    try {
      // https://api.themoviedb.org/3/search/movie?&query=Jack+Reacher
      const request = await axios.get(`/search/movie?include_adult=false&query=${searchTerm}`);
      setSearchResults(request.data.results);
    } catch (error) {
      console.log(error);
    }
  }

  console.log(searchResults)

  const renderSearchResults = () =>{
    return searchResults.length > 0 ? (
      <section className='search-container'>
        {searchResults.map(movie => {
          if(movie.backdrop_path != null && movie.media_type !== "person"){
            const movieImageUrl = "https://image.tmdb.org/t/p/w500"+movie.backdrop_path;
            return(
              <div className='movie'> 
              {/* 키값을 넣어야함.  */}
                <div className='movies__searched' onClick={()=>navigate
                (`/${movie.id}`)}>
                  <img src={movieImageUrl} alt={movie.title} className='movie__bg' />
                  <div className='movie-clearfix'>
                  <div className='movie-wrap'>
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className='movie__poster' />
                    <div className='search-content'>
                      <h2 className='movie__title'>{movie.title || movie.name}</h2>
                      <p className='movie__release_date'>{movie.release_date ? movie.release_date : movie.first_air_date}</p>
                      <p className='movie__score'>{parseInt(movie.popularity)}</p>

                     <p className='movie__vote'>평점 : <span>{Math.round(movie.vote_average*10)/10}</span></p>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            )
          }
        })}
      </section>
    ) : (
      <section className='no-results'>
        <div className='no-results__text'>
          <p>
            찾고자하는 검색어 "{searchTerm}"에 해당하는 영화가 없습니다. 
          </p>
        </div>
      </section>
    )
  }
  return renderSearchResults();
}

export default SearchPage
