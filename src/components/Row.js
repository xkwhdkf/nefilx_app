import axios from 'api/axios.js';
import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import 'styles/row.css'
import MovieModal from './MovieModal';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

function Row({isLargeRow, title, id, fetchUrl}) {
  const [movies, setMovies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movieSelected, setMovieSelected] = useState({});
  useEffect(() => {
    fetchMovieData(); 
  },[fetchUrl])

  const fetchMovieData = async() =>{
    const request = await axios.get(fetchUrl);
    setMovies(request.data.results);
  }
  const handleClick = (movie) => {
    setModalOpen(true);
    console.log(modalOpen)
    setMovieSelected(movie);
  }

  return (
    <section key={id}>
      <h2 className='row'>{title}</h2>
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        navigation
        pagination={{ clickable: true }}
        loop={true}
        breakpoints={{1378:{
          slidesPerView:6,
          slidesPerGroup:6,
        },998:{
          slidesPerView:5,
          slidesPerGroup:5,
        },625:{
          slidesPerView:4,
          slidesPerGroup:4,
        },0:{
          slidesPerView:3,
          slidesPerGroup:3,
        }}}
      >
      {/* <div className='slider'>
        <div className='slider__arrow left'>
          <span className='arrow' onClick={() =>{document.getElementById(id).scrollLeft -=(window.innerWidth - 80)}}>
            {"<"}
          </span>
        </div> */}
        <div id={id} className='row__posters'>
          {movies.map((movie,idx) => (
            <SwiperSlide key={idx}>
              <img key={movie.id} onClick={() => handleClick(movie)} // 클릭하면 함수에 영화 정보를 입력. 익명함수가 아니라 바로 호출하면 자동적으로 실행된다. 
              className={`row__poster ${isLargeRow && ("row__posterLarge")}`}
              src={`https://image.tmdb.org/t/p/original/${isLargeRow ? movie.poster_path : movie.backdrop_path}`}
              loading='lazy'
              alt={movie.title || movie.name || movie.original_name}
            />
            </SwiperSlide>
          ))}
        </div>
          {/* <div className='slider__arrow right'>
            <span className='arrow' onClick={() => {document.getElementById(id).scrollLeft += (window.innerWidth + 80)}}>
              {">"}
            </span>
          </div>
      </div> */}
      </Swiper>
      {modalOpen && ( // 스프레스 연산자로 넣어주면 각각의 키값으로 들어감.
        <MovieModal {...movieSelected} setModalOpen={setModalOpen}></MovieModal>
      )}
    </section>
  )
}



export default Row