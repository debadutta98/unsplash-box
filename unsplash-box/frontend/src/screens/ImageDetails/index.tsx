import { Blurhash } from 'react-blurhash';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';
import style from './index.module.sass';
import addIcon from '../../assets/Plus.svg';
import downArrowIcon from '../../assets/down arrow.svg';
import AddToCollection from '../../components/Modal/AddToCollection';
import { useContext, useEffect } from 'react';
import { context } from '../../context';
import { downloadImage, fetch, getCacheKey } from '../../utils';
import AddRemoveCollection from '../../components/AddRemoveCollection';
import AddRemoveCollectionSkeleton from '../../components/AddRemoveCollection/index.skeleton';
import Skeleton from 'react-loading-skeleton';
import usePageCount from '../../hooks/usePageCount';
import useSWRInfinite from 'swr/infinite';
import { Collection } from '../../types';
import toast from 'react-hot-toast';
const ImageDetails = () => {
  const params = useParams();
  const { pageCount, containerRef, setPage } = usePageCount(90);
  const { openModal, isModalOpen } = useContext(context);
  const { data: photo, isLoading } = useSWR(getCacheKey('getPhoto', { photoId: params.photoId as string }), fetch, {
    onError() {
      toast.error('Error while fetching image details');
    },
  });
  const {
    data,
    isLoading: isCollectionsLoading,
    setSize,
  } = useSWRInfinite<{ pages: number; results: Array<Omit<Collection, 'previews'>> }>(
    (index: number) =>
      getCacheKey('getPhotoCollections', { photoId: params.photoId as string, page: index + 1, limit: 5 }),
    fetch,
    {
      revalidateAll: true,
      initialSize: 0,
      parallel: true,
      revalidateFirstPage: false,
      onSuccess(data) {
        if (Array.isArray(data) && data.length > 0) {
          const lastPageResult = data[data.length - 1];
          setPage((pages) => ({
            ...pages,
            pageLimit: lastPageResult.pages,
          }));
        }
      },
      onError() {
        toast.error('Error occurred while fetching the page');
      },
    }
  );

  useEffect(() => {
    setSize(pageCount);
  }, [pageCount, setSize]);

  const collections = data?.map((value) => value.results).flat();
  return (
    <div className={style['details-layout']}>
      {isModalOpen && <AddToCollection photoId={params.photoId as string} />}
      <div className={style['img-ctn']}>
        {!isLoading && photo ? (
          <LazyLoadImage
            alt={photo.alt_description}
            src={photo.urls.full}
            placeholder={<Blurhash hash={photo.blur_hash} width={photo.width} height={photo.height} />}
            effect="blur"
            threshold={30}
            width={'100%'}
          />
        ) : (
          <Skeleton style={{ width: '100%', height: '90vh' }} />
        )}
      </div>
      <div className={style['img-details']}>
        <div className={style['user-details']}>
          {!isLoading && photo ? (
            <>
              <img src={photo.user.profile_image.medium} alt={photo.user.username} />
              <span>{photo.user.name}</span>
            </>
          ) : (
            <>
              <Skeleton circle={true} style={{ width: '5rem', aspectRatio: '1/1' }} />
              <Skeleton style={{ width: '120px', height: '30px' }} />
            </>
          )}
        </div>

        {!isLoading && photo ? (
          <span>
            Published on{' '}
            {new Date(photo.promoted_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ) : (
          <Skeleton style={{ width: '250px', height: '25px' }} />
        )}
        <div className={style['btn-ctn']}>
          <button className={style['btn']} onClick={openModal} disabled={isLoading || !photo}>
            <img src={addIcon} alt="add to collection icon" />
            Add to Collection
          </button>
          <button
            className={style['btn']}
            disabled={isLoading || !photo}
            onClick={() => downloadImage(photo?.urls?.full, `${photo?.id}.jpg`)}
          >
            <img src={downArrowIcon} alt="download icon" />
            Download
          </button>
        </div>
        <div className={style['collections-ctn']}>
          <h2>Collections</h2>
          {!isCollectionsLoading && Array.isArray(collections) ? (
            <AddRemoveCollection
              action="remove"
              collections={collections}
              photoId={params.photoId as string}
              ref={containerRef}
              style={{ height: '30rem' }}
            />
          ) : (
            <AddRemoveCollectionSkeleton colCount={5} action="remove" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageDetails;
