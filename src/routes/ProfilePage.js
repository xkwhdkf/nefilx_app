import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { auth, db, storage } from '../firebase'
import { signOut, updateProfile } from 'firebase/auth'
import React, { Children, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { faCaretDown, faPen, faPencil, faPlus } from '@fortawesome/free-solid-svg-icons'
import { collection, deleteDoc, doc, getDocs, query, setDoc } from 'firebase/firestore'
import { v4 as uuid } from 'uuid'
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { defaultFace } from 'default'

function ProfilePage() {
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newFace, setNewFace] = useState(defaultFace);
  const [newName, setNewName] = useState("");
  const [faceBefore, setFaceBefore] = useState(""); 
  const [nameBefore, setNameBefore] = useState("");
  const [userProfiles, setUserProfiles] = useState([]);
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  let profileInfo = {};
  let docSnapshot = [];
  const [fileName, setFileName] = useState(""); // 사실상 문서 id

  useEffect(()=>{
    getProfiles()    
  },[])

  const getProfiles = async() => {
    const q = query(collection(db, `${auth.currentUser.uid}`));
    const querySnapshot = await getDocs(q);
    docSnapshot = querySnapshot.docs;
    setUserProfiles(docSnapshot);

  }
  if(userProfiles==""){
    console.log(`페이지 로딩 시 프로필 불러오기`);
    getProfiles();
  }

  const onChangeFace = (e) =>{
    setFaceBefore(newFace);
    const {target:{files}} = e;
    const theFile = files[0];

    const reader = new FileReader();
    reader.onloadend = (e) =>{
      const {currentTarget:{result}} = e;
      setNewFace(result);
    }
    reader.readAsDataURL(theFile);
  }
  const onChangeName = useCallback((e) =>{
    const {target:{value}} = e;
    setNewName(value);
  },[]);
  
  const onSubmit = async(e) =>{
    e.preventDefault();
    // 이게 새로운 프로필인지 기존의 프로필인지 조건을 따지기 귀찮으니 차라리 접근을 제한.
    let fileUrl;
    const storageRef = ref(storage, `${auth.currentUser.uid}/profile/${fileName}`);
    if(faceBefore !== newFace){ //이미지 변경이 있을 시 사진 업로드 진행
      try {
        const upload = await uploadString(storageRef, newFace, 'data_url');
        fileUrl = await getDownloadURL(ref(storage, upload.ref));
        await setNewFace(fileUrl);
      } catch (error) {
        console.log(error);
      }
    }
    if(nameBefore !== newName){ // 프로필 정보 문서 업로드
      try { 
        await setDoc(doc(db,`${auth.currentUser.uid}`,`${fileName}`),{
          displayname:newName,
          fileName:fileName,
          fileUrl:fileUrl
        })
      } catch (error) {
        console.log(error)
      }
    }
    console.log(fileUrl)
    console.log(`${newName} submit done`);
    setIsEditing(prev=>!prev);
    setEdit(prev=>!prev);
    getProfiles();
  }
  async function onEditProfile(idx){
    profileInfo = await userProfiles[idx].data();
    setNameBefore(newName);
    setFaceBefore(newFace);
    setFileName(profileInfo.fileName);

    await setNewName(profileInfo.displayname);
    await setNewFace(profileInfo.fileUrl);
    setIsEditing(true);
    console.log(profileInfo.fileName);
  } 

  const onAddProfile = async(e) => {
    const q = query(collection(db, `${auth.currentUser.uid}`));
    const querySnapshot = await getDocs(q);
    await setUserProfiles(querySnapshot.docs);
    const length = userProfiles.length;
    const fileName = uuid();
    if(length < 6){
      // add profile
      try {
        await setDoc(doc(db,`${auth.currentUser.uid}`,`${fileName}`),{
          displayname:`name_${uuid()}`,
          fileName:fileName,
          fileUrl:defaultFace,
          date:Date.now()
        })
        console.log(`문서업로드`);
        getProfiles();
      } catch (error) {
        console.log(error)
      }
    } else {
      console.log('프로필 최대상한도달');
    }
  }

  const onDeleteProfile = async() =>{
    console.log(userProfiles.length);
    console.log(profileInfo)
    try {
      if(userProfiles.length-1!==0){
      await deleteDoc(doc(db, `${auth.currentUser.uid}`, `${fileName}`));
      sendAlert(`프로필이 삭제되었습니다.`);
    } else console.log(`최소 1개의 프로필은 존재해야함`);
    } catch (error) {
      console.log(error)
    }
    setIsEditing(prev=>!prev);
    setEdit(prev=>!prev);
    getProfiles();
  }

  const onLogoutClick = async(e) =>{
    await auth.signOut();
    navigate('/');
  }

  async function onSelectProfile(idx) {
    // console.log(idx)
    profileInfo = userProfiles[idx].data();
    const profile_list = document.querySelectorAll("li.profile");
    // profile_list.forEach((el,i)=>{
    //   el.style.border = `2px solid #111`;
    // })
    // profile_list[idx].style.borderBottomColor = `var(--deepred)`;
    // // profile_list[idx].style.borderTopColor = `#111`;
    try {
      const update = await updateProfile(auth.currentUser,{
        displayName:profileInfo.displayname, photoURL:profileInfo.fileUrl,
      });
      sendAlert(`프로필이 변경되었습니다.`);
    } catch (error) {
      console.log(error);
    }
  }
  function sendAlert(text){
    setAlertMessage(text);
    setAlert(true);
    const timer = setInterval(() => {
      setAlert(false);
      clearInterval(timer);
    }, 500);
  }
  return (
    <ProfileContainer>
      <h2 className='blind'>프로필 관리</h2>
      {alert && (     
        // 알림창 
        <AlertWindow> 
          <p className='error'>{alertMessage}</p>
        </AlertWindow>)}
      {isEditing ? (
        // 프로필 생성 / 설정 변경
        <EditProfile> 
          <form className='profile__form-edit' onSubmit={onSubmit}>
            <legend>프로필 변경</legend>
            <fieldset>
              <div className='form__top-wrap'>
                <div className='form__face'>
                  <div className='face-wrap'>
                  <img src={newFace} alt='' className='face'></img>
                  <input type='file' onChange={onChangeFace} id='input_face_change' accept="image/*"></input>
                  <label htmlFor='input_face_change' className='face__btn-edit'>
                    <FontAwesomeIcon icon={faPencil} />
                  </label>
                  </div>
                </div>
                <div className='form__content'>
                  <div className='form__content-top'>
                    <input type='text' onChange={onChangeName} value={newName} required></input>
                    <dl>
                      <dt>언어</dt>
                      <dd>
                      <ul className='lang__list'>
                      <li>한국어<FontAwesomeIcon icon={faCaretDown} /></li>
                      <li>
                      </li>  
                      </ul></dd>
                    </dl>
                  </div>
                  <div className='form__content-mid'>
                    <dl>
                      <dt>관람등급 설정:</dt>
                      <dd>모든 관람등급</dd>
                      <dd>이 프로필에서는 모든 관람등급의 콘텐츠가 표시됩니다.</dd>
                    </dl>
                    {/* 어떻게 등급에 따라 설명을 바꾸고 설명을 뭐로 태그할 것인가. */}
                  </div>
                  <div className='form__content-bottom'>
                    <dl>
                      <dt>자동 재생 설정</dt>
                      <dd>
                        <input type='checkbox' id='onNextplay'></input>
                        <label htmlFor='onNextplay'>모든 디바이스에서 시리즈의 다음 화 자동 재생</label>
                      </dd>
                      <dd>
                        <input type='checkbox' id='onPreplay'></input>
                        <label htmlFor='onPreplay'>모든 디바이스에서 탐색 중 미리보기 자동 재생</label>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className='form__btns-wrap'>
              <button type='submit' className='form__btn-confirm'>저장</button>
              <button type='button' className='form__btn-cancel' onClick={()=>{setIsEditing(prev=>!prev);setEdit(prev=>!prev)}}>취소</button>
              <button type='button' className='form__btn-delete' onClick={onDeleteProfile}>프로필 삭제</button>
              </div>
            </fieldset>
          </form>
        </EditProfile>
      ):(
        // 기본
        <Profiles> 
        <p className='profile__text'>Netflix를 시청할 프로필을 선택하세요.</p>
        <ul className='profile-wrap'>
          {userProfiles.map((profile,idx) =>{
              return(
              <li className='profile' key={idx} onClick={()=> edit===false && onSelectProfile(idx)}>
                {edit && (
                  <div className='edit__btn' onClick={()=>onEditProfile(idx)}>
                    <span >
                      <FontAwesomeIcon icon={faPen}></FontAwesomeIcon>
                    </span>
                  </div>
              )}
                <img src={`${profile.data().fileUrl}`} alt=''></img>
              </li>
              )
            })
          }
          {userProfiles.length <6 &&(
            <li>
            <AddProfile>
              <div className='icon-wrap' onClick={onAddProfile}>
                <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
              </div>
              <p>프로필 추가</p>
            </AddProfile>
            </li>
          )}
        </ul>
        <button type='button' onClick={()=>{setEdit(prev=>!prev)}} className='profile__btn-toggle'>프로필 관리</button>
        <button onClick={onLogoutClick} className='logout'>로그아웃</button>
      </Profiles>
      )}
     
    </ProfileContainer>
  )
}

export default ProfilePage
 // 전체 wrap
const ProfileContainer = styled.div`
height:100vh;
`
 // 수정화면
const EditProfile = styled.div`
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
height:100vh;
color:#fff;
  .profile__form-edit{
    legend{
      font-size:32px;
      margin-bottom:10px;
    }
    fieldset{
      .form__top-wrap{
        display:flex;
        flex-wrap:nowrap;
        .form__face{
          margin-right:10px;
          padding-top:10px;
          .face-wrap{
            position:relative;
            width:80px;
            height:80px;
              .face{
                width:100%;
                height:100%;
                object-fit:cover;
              }
              input[type="file"]{
                display:none;
              }

            .face__btn-edit{
              position:absolute;
              left:2px;
              bottom:2px;
              width:22px;
              height:22px;
              border:1px solid #fff;
              border-radius:50%;
              cursor:pointer;
              svg{
                position:absolute;
                top: calc(50% - 5.5px);
                left: calc(50% - 5.5px);
                font-size:11px;
              }
            }
          }
        }
        .form__content{
          div{
            padding: 10px 0; 
            border-top:1px solid #333;
            box-sizing:boder-box;
          }
          .form__content-top{
            input[type="text"]{
              width:100%;
              margin-bottom:32px;
              padding:8px 8px;
              box-sizing:border-box;
            }
            .lang__list{
              display:inline-block;
              padding:4px;
              border:1px solid #ddd;
              font-size:14px;
              li{
                svg{
                  margin-left:40px;
                }
              }
            }
          }
          .form__content-mid{}
          .form__content-bottom{}
          dt{
            color:#ccc;
          }
          dd{
            margin:10px 0;
            font-size:14px;
          }
        }

      }

      .form__btns-wrap{
        display:flex;
        width:100%;
        padding-top:28px;
        border-top:1px solid #333;
        button{
          width:auto;
          margin-right:10px;
          padding: 0 20px;
          background: transparent;
          line-height:32px;
          border:1px solid #bbb;
          border-radius: 2px;
          color:#bbb;
          cursor:pointer;
        }
      }
    }
  }

`
// 디폴트 화면
const Profiles = styled.div`
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
width:100%;
height:100%;
  .profile__text{
    color:#fff;
    font-size:28px;
  }
  .profile-wrap{
    display:flex;
    margin:20px 0 80px;
    .profile{
      overflow:hidden;
      position:relative;
      width:80px;
      height:80px;
      border: 2px solid #111;
      border-radius:8px;
      margin-right:20px;
      box-sizing:border-box;
      cursor:pointer;
      filter:brightness(.95) grayscale(0.1);
      &:hover{
        filter:brightness(1.05);
      }
      &:last-of-type{
        margin-right:0;
      }
      .edit__btn{
        display:flex;
        justify-content:center;
        align-items:center;
        position:absolute;
        width:100%;
        height:100%;
        backdrop-filter: blur(2px) grayscale(0.7);
        span{
          display:flex;
          justify-content:center;
          align-items:center;
          width:32px;
          height:32px;
          border:1px solid #fff;
          border-radius:50%;
          cursor:pointer;
          svg{
            color:#fff;
          }
        }
      }
      img{
        width:100%;
        height:100%;
        object-fit:cover;
      }
    }
  }
  .profile__btn-toggle{
    width:120px;
    margin-bottom:20px;
    background: transparent;
    line-height:32px;
    border:1px solid #bbb;
    border-radius: 2px;
    color:#bbb;
    cursor:pointer;
  }
  .logout{
    width:120px;
    background: transparent;
    line-height:32px;
    border:1px solid #bbb;
    border-radius: 2px;
    color:#bbb;
    cursor:pointer;
    transition:all 0.2s ease-in;
    &:hover{
      background: var(--red);
      border-color:var(--red);
      font-weight:bold;
      color:#fff;
    }
  }
`
// 프로필 추가 버튼
const AddProfile = styled.div`
display:flex;
justify-content:center;
align-items:center;
position:relative;
width:80px;
height:80px;
border-radius:8px;
  .icon-wrap{
    display:flex;
    justify-content:center;
    align-items:center;
    width:40px;
    height:40px;
    background:#ddd;
    border-radius:50%;
    cursor:pointer;
    svg{
      font-size:32px;
      color:#111;
    }
  }
  p{
    position:absolute;
    bottom:0;
    font-size:12px;
    color:#ccc;
    transform:translateY(100%);
  }
`

const AlertWindow = styled.div`
z-index:22;
display:flex;
justify-content:center;
align-items:center;
position:fixed;
top:50%;
left:50%;
width:320px;
height:60px;
background:rgba(255,255,255,0.8);
box-sizing:border-box;
border-radius:4px;
transform:translate(-50%,-220%);
  p{
    color:#111;
    transition:opacity 0.5s linear;
    &.on{
      opacity:1;
    }
  }
`