import CollectionItem from '../../components/CollectionItem';
import { fetch, getCacheKey } from '../../utils';
import usePageCount from '../../hooks/usePageCount';
import React, { useEffect } from 'react';
import { Collection } from '../../types';
import style from './index.module.sass';
import CollectionItemSkeleton from '../../components/CollectionItem/index.skeleton';
import NoResultsFound from '../../components/NoResultFound';
import useSWRInfinite from 'swr/infinite';
import toast from 'react-hot-toast';

const CollectionList: React.FC = () => {
  const { data, isLoading, setSize } = useSWRInfinite<{
    results: Array<Collection>;
    pages: number;
  }>((index: number) => getCacheKey('getAllCollections', { page: index + 1, limit: 10 }), fetch, {
    revalidateFirstPage: false,
    parallel: true,
    revalidateAll: true,
    initialSize: 0,
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
  });
  const { pageCount, setPage } = usePageCount(90);

  useEffect(() => {
    setSize(pageCount);
  }, [pageCount, setSize]);

  const collections = data?.map((value) => value.results).flat();
  return (
    <div className={style['collections']} style={{ padding: '2% 5%' }}>
      {!isLoading ? (
        Array.isArray(collections) && collections.length > 0 ? (
          collections.map((collection) => <CollectionItem collection={collection} key={collection.id} />)
        ) : (
          <NoResultsFound />
        )
      ) : (
        Array.from({ length: 10 }).map((_, index) => <CollectionItemSkeleton key={'rendering-' + index} />)
      )}
    </div>
  );
};

export default CollectionList;
