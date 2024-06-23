import React from 'react';
import Skeleton from 'react-loading-skeleton';

const ImageItemSkeleton: React.FC = () => {
  return <Skeleton width={'100%'} height={Math.floor(Math.random() * 350) + 250} borderRadius={'8px'} />;
};

export default ImageItemSkeleton;
