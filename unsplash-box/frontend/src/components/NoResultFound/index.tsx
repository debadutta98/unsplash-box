import React from 'react';
import placeHolderImg from '../../assets/undraw_no_data_re_kwbl.svg';
import style from './index.module.sass';
const NoResultsFound: React.FC = () => {
  return (
    <div className={style['container']}>
      <img src={placeHolderImg} alt="no data found" />
      <span>No Result Found</span>
    </div>
  );
};

export default NoResultsFound;
