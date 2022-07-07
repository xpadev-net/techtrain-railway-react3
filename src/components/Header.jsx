import React from 'react';
import { useCookies } from 'react-cookie';
import { useSelector, useDispatch } from 'react-redux/es/exports';
import {Link, useNavigate} from 'react-router-dom';
import { signOut } from '../authSlice';
import './header.scss';

export function Header() {
  const auth = useSelector((state) => state.auth.isSignIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [,, removeCookie] = useCookies();
  const handleSignOut = () => {
    dispatch(signOut());
    removeCookie('token');
    navigate('/signin');
  };

  return (
    <header className="header">
      <Link to={"/"}><h1>Todoアプリ</h1></Link>
      {auth ? <button onClick={handleSignOut} className="sign-out-button">サインアウト</button> : <></>}
    </header>
  );
}
