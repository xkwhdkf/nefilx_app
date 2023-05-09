import requests from 'api/requests'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'api/axios.js';
import { collection, doc, getDocs, query, setDoc } from 'firebase/firestore';
import { v4 as uuid } from 'uuid';
import { defaultFace } from 'default';

function JoinPage() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  const [movies, setMoives] = useState([]);
  const [error, setError] = useState("");
  const [langMenu,setLangMenu] = useState(false);
  const [language, setLanguage] = useState("한국어");
  useEffect(() =>{
    getMovie();
  },[])

  const getMovie = async()=>{

    const request = await axios.get(requests.fetchNowPlaying);
    await setMoives(request.data.results);

  }
  const onChange = useCallback((e) =>{
    if(e.target.name==='newId'){
      setId(e.target.value);
      // console.log(id)
    }
    if(e.target.name==='newPw'){
      setPw(e.target.value);
      // console.log(pw)
    }
  },[id, pw]);

  const onSubmit = useCallback(async(e) =>{
    e.preventDefault();
    try {
      const join = await createUserWithEmailAndPassword(auth, id, pw);

      const q = query(collection(db, `${auth.currentUser.uid}`));
      const docRef = await getDocs(q);
      const profileNum = docRef.docs.length; // 갯수파악
      console.log(docRef);
      const fileName = uuid();
      try {
        const init = await setDoc(doc(db,`${auth.currentUser.uid}`,`${fileName}`),{
          displayname:`name_${uuid()}`,
          fileName:fileName,
          fileUrl:defaultFace,
          date:Date.now()
        });
        try {
          const update = await updateProfile(auth.currentUser,{
            displayName:`name_${uuid()}`, photoURL:defaultFace
          });
          console.log(auth.currentUser);
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
      let message="";
      switch (error.code) {
        case "auth/user-not-found" || "auth/wrong-password":
          message = "이메일 혹은 비밀번호가 일치하지 않습니다.";
          break;
        case "auth/email-already-in-use":
          message = "이미 사용 중인 이메일입니다.";
          break;
        case "auth/weak-password":
          message = "비밀번호는 6글자 이상이어야 합니다.";
          break;
        case "auth/invalid-email":
          message = "잘못된 이메일 형식입니다.";
          break;
        default:
          message = "로그인에 실패하였습니다.";
          break;
      }
      setError(message);
    }

  },[id, pw]);
  const onLangClick = useCallback((e) =>{
    console.log(e.target);
    setLanguage(`${e.target.innerText}`);
    setLangMenu(false);
  },[langMenu])
  return (
    <Container>
      <Top_menu>
        <dt className='blind'>탑메뉴</dt>
        <dd className='lang'>
          <ul>
          <li onClick={()=>{setLangMenu(prev=>!prev)}}>
          {language}<span></span>
          </li>
          {langMenu && (
          <>
          <li onClick={onLangClick}>한국어</li>
          <li onClick={onLangClick}>영어</li>
          </>
          )}
          </ul></dd>
        <dd onClick={() => {navigate('login')}} className='login'>로그인</dd>
      </Top_menu>
      <Join>
        <h2 className='blind'>회원가입</h2>
        <p style={{fontSize:40, fontWeight:`bold`,marginBottom:20}}><strong>영화와 시리즈를 무제한으로.</strong></p>
        <p>다양한 디바이스에서 시청하세요. 언제든 해지하실 수 있습니다.</p>
        <p style={{marginTop:10}}>시청할 준비가 되셨나요? 멤버십을 등록하거나 재시작하려면 이메일 주소를 입력하세요.</p>
        <form onSubmit={onSubmit}>
        <fieldset>
        <legend className='blind'>회원가입입력</legend>
          <input type='email' onChange={onChange} name='newId' required placeholder='이메일 주소'></input>
          <input type='password' onChange={onChange} name='newPw' required placeholder='비밀번호'></input>
          <p className='error'>{error}</p>
          <button type='submit'>시작하기<FontAwesomeIcon icon={faChevronRight}></FontAwesomeIcon></button>
          </fieldset>
        </form>
      </Join>
        <div className='bg'>
          <ul>
            {movies.map((movie,index) =>(
              <li key={index}><img src={`https://image.tmdb.org/t/p/original/${movie.poster_path}`} alt={movie.title || movie.name || movie.original_name} /></li>
            ))}
          </ul>
        </div>
    </Container>
  )
}


const Container = styled.div`
padding-top: 120px;
width:100%;
height:calc(100vh - 174px);
background: #111;
box-sizing:border-box;
  .blind{
    display:none;
  }
  .bg{
    overflow:hidden;
    position:absolute;
    bottom:50vh;
    left:0;
    min-width:920px;
    transform:translateY(50%);
    ul{
      display:flex;
      flex-wrap:wrap;
      li{
        width:10%;
        min-width:92px;
        img{
          width:100%;
          min-width:92px;
          height:100%;
          max-height:210px;
          min-height:138px;
          padding:4px;
          box-sizing:border-box;
          filter:blur(1px);
          object-fit:cover;
        }
      }
    }
`
const Top_menu = styled.dl`
z-index:12;
display:flex;
position:absolute;
top:20px;
right:50px;
  dd{
    display:flex;
    align-items:center;
    line-heigth:1;
    color:#fff;
    cursor:pointer;
    &.lang{
      margin-right:20px;
      ul{
        height:30px;
        li{
          display:flex;
          justify-content:space-between;
          position:relative;
          top:0;
          left:0;
          width:100px;
          height:30px;
          padding:4px 16px;
          box-sizing:border-box;
          &:hover{
            color:#bbb;
          }
          span{
            width:12px;
            height:100%;
            padding-left:4px;
            &:after{
            content:"";
            display:inline-block;
            width:0;
            border:none;
            border-left:8px solid transparent;
            border-bottom:8px solid #fff;
            transform:rotate(45deg) translateY(-50%);
            }
        }
      }
     
      }
    }
  }
`
const Join = styled.section`
z-index:11;
position:absolute;
width:auto;
top:16%;
right:0;
padding: 32px;
color:#fff;
background:rgba(1,1,1,0.8);
  form{
    margin:40px auto;
    fieldset{
      border:none;
      display:flex;
      flex-direction:column;
      input{
        width:50%;
        height:50px;
        margin-bottom:16px;
        padding: 0 8px;
        border-radius:0 0 2px 2px;
        box-sizing:border-box;
        outline:none;
        border:2px solid transparent;
        &:focus{
          border-bottom-color:var(--red);
          
        }
      }
      .error{
        height:32px;
        margin-bottom:16px;
        color:var(--red);
        line-height:32px;
      }
      button{
        width:50%;
        height:60px;
        background:rgb(229, 9, 20);
        border-radius:2px;
        font-size:28px;
        font-weight:500;
        color:#fff;
        outline:none;
        border:none;
        cursor:pointer;
        transition: background 0.2s linear;
        &:hover{
          background:rgb(185, 7, 16);
        }
      }
    }
  }
`
export default JoinPage