import React from 'react';
import searchIcon from '../../assets/Search.svg';
import style from './index.module.sass';
import { SearchBoxProps } from '../../types';
const SearchBox: React.FC<SearchBoxProps & React.HTMLProps<HTMLInputElement>> = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div className={className ? className + ' ' + style['search-box'] : style['search-box']}>
        <input className={style['search-input']} {...props} ref={ref} />
        <img src={searchIcon} alt="search icon" className={style['search-icon']} />
      </div>
    );
  }
);

export default SearchBox;
