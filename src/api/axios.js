import axios from "axios";

const instance = axios.create({
  baseURL : "https://www.themoviedb.org/movie",
  params : {
    api_key : process.env.REACT_APP_MOVIE_DB_API_KEY,
    language : "ko-KR", //en-US
  }
})

export default instance;