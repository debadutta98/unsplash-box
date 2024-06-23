import React from 'react';
import { Collection } from '../../types';
import { Link } from 'react-router-dom';
import style from './index.module.sass';

const CollectionItem: React.FC<{ collection: Collection }> = ({ collection }) => {
  const secondDivWidth = Math.max(100 / collection.previews.length, 40);
  const firstDivWidth = 100 - secondDivWidth;
  return (
    <Link to={collection.id} className={style['layout']}>
      <div
        className={style['preview-layout']}
        style={{ gridTemplateColumns: `repeat(${collection.previews.length > 1 ? 2 : 1}, 1.5fr)` }}
      >
        <div style={{ width: '100%' }}>
          <img
            src={collection.previews[0].full}
            alt="first image"
            style={{
              borderRadius: firstDivWidth === 0 ? '8px' : '8px 0px 0px 8px',
            }}
          />
        </div>
        {collection.previews.length > 1 && (
          <div style={{ width: '100%' }}>
            {collection.previews.length > 1 && (
              <img
                src={collection.previews[1].full}
                alt="second image"
                style={{
                  borderRadius: secondDivWidth === 50 ? '0px 8px 8px 0px' : '0px 8px 0px 0px',
                  height: collection.previews.length === 2 ? '100%' : '49.5%',
                }}
              />
            )}
            {collection.previews.length > 2 && (
              <img
                src={collection.previews[2].full}
                alt="third image"
                style={{ borderRadius: '0px 0px 8px 0px', height: '49.5%' }}
              />
            )}
          </div>
        )}
      </div>
      <div className={style['collection-info']}>
        <span>{collection.title}</span>
        <span>{collection.total_photos} photos</span>
      </div>
    </Link>
  );
};

export default CollectionItem;
