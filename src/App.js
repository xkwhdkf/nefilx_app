import requests from 'api/requests';
import Banner from 'components/Banner';
import Footer from 'components/Footer';
import Nav from 'components/Nav'
import Row from 'components/Row';
import { auth } from './firebase';
import { useEffect, useState } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import DetailPage from 'routes/DetailPage';
import JoinPage from 'routes/JoinPage';
import MainPage from 'routes/MainPage';
import ProfilePage from 'routes/ProfilePage';
import SearchPage from 'routes/SearchPage';
import 'styles/app.css'
import { onAuthStateChanged } from 'firebase/auth';
import LoginPage from 'routes/LoginPage';

const Layout = () => {
  return (
    <div>
    <Nav></Nav>
    <Outlet></Outlet> 
    <Footer></Footer>
    </div>
  )
} //레이아웃을 함수형 컴포넌트. 아웃렛에 자식경로 요소가 들어간다. 

function App() {
  const [login, setLogin] = useState(auth.currentUser);
  const [userInfo, setUserInfo] = useState(auth.currentUser);


  useEffect(() =>{
    onAuthStateChanged(auth, (user) =>{
      setLogin(user);
      setUserInfo(user);
    })
    console.log(login)
  },[login]); // 라우터 > 라우터로 되어있어서 시간이 걸리는듯. 

  return (
    <div className="app">
      <Routes>
        <Route path={`/`} element={<Layout />}>
          { !login ? (
          <Route index element={<JoinPage />}></Route>
          ) : (
          <Route index element={<MainPage />}></Route>
          )
          }
          {/* index = 부모주소가져옴 */}
          <Route path=':movieId' element={<DetailPage />}></Route>
          {/* :으로 state 값을 넣어줄수있다.  */}
          <Route path='search' element={<SearchPage />}></Route>
          <Route path='profile' element={<ProfilePage></ProfilePage>}></Route>
          <Route path='login' element={<LoginPage></LoginPage>}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
