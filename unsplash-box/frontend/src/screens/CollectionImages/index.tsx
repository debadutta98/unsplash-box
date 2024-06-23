import { useOutletContext, useParams } from 'react-router-dom';
import usePageCount from '../../hooks/usePageCount';
import { useEffect } from 'react';
import Gallery from '../../components/Gallery';
import { fetch, getCacheKey } from '../../utils';
import ImageItem from '../../components/ImageItem';
import ImageItemSkeleton from '../../components/ImageItem/index.skeleton';
import { CollectionResponse, CollectionState } from '../../types';
import NoResultsFound from '../../components/NoResultFound';
import useSWRInfinite from 'swr/infinite';
import toast from 'react-hot-toast';

const CollectionImages: React.FC = () => {
  const params = useParams<string>();
  const [setDetails] = useOutletContext<[(state: CollectionState) => CollectionState]>();
  const { data, isLoading, setSize } = useSWRInfinite<CollectionResponse & { pages: number }>(
    (index: number) =>
      getCacheKey('getCollectionImages', { collectionId: params.collectionId as string, page: index + 1, limit: 10 }),
    fetch,
    {
      revalidateAll: true,
      parallel: true,
      initialSize: 0,
      revalidateFirstPage: false,
      onSuccess(data) {
        if (Array.isArray(data) && data.length > 0) {
          const lastPageResult = data[data.length - 1];
          setPage((pages) => ({
            ...pages,
            pageLimit: lastPageResult.pages,
          }));
          setDetails({
            title: lastPageResult.title,
            subTitle: `${lastPageResult.total_photos} photos`,
          });
        }
      },
      onError() {
        toast.error('Error occurred while fetching the page');
      },
    }
  );
  const { pageCount, setPage } = usePageCount(90);

  useEffect(() => {
    setSize(pageCount);
  }, [pageCount, setSize]);

  const photos = data?.map((value) => value.photos).flat();
  if (isLoading) {
    return (
      <Gallery colCount={4} width={'100%'}>
        {Array.from({ length: 10 }).map((_, index) => (
          <ImageItemSkeleton key={'imageItem-' + index} />
        ))}
      </Gallery>
    );
  } else if (data && Array.isArray(photos)) {
    return (
      <Gallery colCount={4} width={'100%'}>
        {photos.map((image) => (
          <ImageItem image={image} key={image.id} />
        ))}
      </Gallery>
    );
  } else {
    return (
      <div style={{ width: '30%', display: 'flex', margin: 'auto' }}>
        <NoResultsFound />
      </div>
    );
  }
};

export default CollectionImages;
