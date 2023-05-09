import requests from 'api/requests'
import Banner from 'components/Banner'
import Row from 'components/Row'
import { auth } from '../firebase'
import React, { useState } from 'react'

function MainPage() {

  return (
    <div>
    <Banner />
    <Row title="Nexflix Original" id="NO" fetchUrl={requests.fetchNetflixOriginals} />
    <Row title="Trending Now" id="TN" fetchUrl={requests.fetchTrending} />
    <Row title="Top rated" id="TP" fetchUrl={requests.fetchTopRated} />
    <Row title="Animation Movies" id="AM" fetchUrl={requests.fetchAnimationMovies} />
    <Row title="Famliy Movies" id="FM" fetchUrl={requests.fetchFamilyMovies} />
    <Row title="Adventure Movies" id="ADM" fetchUrl={requests.fetchAdventureMovies} />
    <Row title="Sci-fi Movies" id="SM" fetchUrl={requests.fetchScienceFictionMovies} />
    <Row title="Action Movies" id="ACM" fetchUrl={requests.fetchAnimationMovies} />
    </div>
  )
}

export default MainPage
