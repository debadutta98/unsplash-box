import React from 'react';
import Skeleton from 'react-loading-skeleton';
import style from './index.module.sass';
const CollectionItemSkeleton: React.FC = () => {
  return (
    <div className={style['layout']}>
      <div style={{ width: '100%', height: '340px', borderRadius: '8px' }}>
        <Skeleton
          style={{
            width: '100%',
            display: 'flex',
            height: '100%',
            borderRadius: '8px',
          }}
        />
      </div>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          textAlign: 'start',
        }}
      >
        <Skeleton style={{ width: '20%', height: 18 }} />
        <Skeleton style={{ width: '30%', height: 16 }} />
      </div>
    </div>
  );
};

export default CollectionItemSkeleton;
