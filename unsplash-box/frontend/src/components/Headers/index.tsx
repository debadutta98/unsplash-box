import { NavLink } from 'react-router-dom';
import logo from '../../assets/Logo.svg';
import style from './index.module.sass';
import { NavLinkStyle, changeNavStypeFunc } from '../../types';

function Headers() {
  const changeNavLinkStyle: changeNavStypeFunc = ({ isActive }: NavLinkStyle) =>
    isActive ? `${style['nav-btn']} ${style['active']}` : style['nav-btn'];
  return (
    <header className={style['header']}>
      <NavLink to="/">
        <img src={logo} alt="app logo" className={style['brand-img']} />
      </NavLink>
      <nav className={style['nav']}>
        <NavLink to="/home" className={changeNavLinkStyle}>
          Home
        </NavLink>
        <NavLink to="/collections" className={changeNavLinkStyle}>
          Collections
        </NavLink>
      </nav>
    </header>
  );
}

export default Headers;
