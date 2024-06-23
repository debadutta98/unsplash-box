import React from 'react';
import notFoundImg from '../../assets/undraw_page_not_found_re_e9o6.svg';
import style from './index.module.sass';
const PageNotFound: React.FC = () => {
  return (
    <div className={style['container']}>
      <img src={notFoundImg} alt="404 not found image" />
      <span>Page Not Found</span>
    </div>
  );
};
export default PageNotFound;
