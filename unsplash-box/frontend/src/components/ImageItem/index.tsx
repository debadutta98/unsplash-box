import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Link } from 'react-router-dom';
import { Photo } from '../../types';
import { Blurhash } from 'react-blurhash';
import React from 'react';
const ImageItem: React.FC<{ image: Photo }> = ({ image }) => {
  return (
    <Link to={`/details/${image.id}`} onClick={() => {}}>
      <LazyLoadImage
        alt={image.alt_description}
        src={image.urls.regular}
        threshold={30}
        placeholder={<Blurhash hash={image.blur_hash} width={image.width} height={image.height} />}
        loading="lazy"
        effect="blur"
        width={'100%'}
      />
    </Link>
  );
};

export default ImageItem;
