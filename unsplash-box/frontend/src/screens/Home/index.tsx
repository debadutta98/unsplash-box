import React, { useContext, useRef } from 'react';
import SearchBox from '../../components/SearchBox';
import style from './index.module.sass';
import Search from '../Search';
import { context } from '../../context';
function Home() {
  const { imgQuery, setImgQuery } = useContext(context);
  const ref = useRef<HTMLInputElement>(null);

  const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const value = (ref.current as HTMLInputElement).value;
    if (value !== '' && imgQuery !== value) {
      setImgQuery(value);
    }
  };
  return imgQuery ? (
    <Search />
  ) : (
    <div className={style['home']}>
      <div className={style['container']}>
        <h1>Search</h1>
        <span>Search high-resolution images from Unsplash</span>
        <form onSubmit={onSubmitHandler} style={{ width: '100%' }}>
          <SearchBox placeholder="Enter your keywords..." name="search" ref={ref} />
        </form>
      </div>
    </div>
  );
}

export default Home;
