import { Outlet, useLocation } from 'react-router-dom';
import style from './index.module.sass';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { CollectionState } from '../../types';

const Collections = () => {
  const location = useLocation();
  const [details, setDetails] = useState<CollectionState>({
    title: '',
    subTitle: '',
  });
  return (
    <div className={style['collection']}>
      {location.pathname === '/collections' ? (
        <h1 className={style['collection-heading']}>Collections</h1>
      ) : details.title ? (
        <h1 className={style['collection-heading']}>{details.title}</h1>
      ) : (
        <Skeleton style={{ width: '30%', height: 45 }} />
      )}
      {location.pathname === '/collections' ? (
        <p className={style['collection-description']}>
          Explore the world through collections of beautiful photos free to use under the{' '}
          <a href="https://unsplash.com/license" target="_blank">
            Unsplash License
          </a>
        </p>
      ) : details.subTitle ? (
        <span className={style['collection-description']}>{details.subTitle}</span>
      ) : (
        <Skeleton style={{ width: '25%', height: 25 }} />
      )}
      <Outlet context={[setDetails]} />
    </div>
  );
};

export default Collections;
