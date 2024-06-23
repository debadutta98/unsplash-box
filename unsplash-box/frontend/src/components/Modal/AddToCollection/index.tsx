import React, { useEffect, useRef, useState } from 'react';
import Modal from '..';
import SearchBox from '../../SearchBox';
import style from './index.module.sass';
import AddRemoveCollection from '../../AddRemoveCollection';
import usePageCount from '../../../hooks/usePageCount';
import AddRemoveCollectionSkeleton from '../../AddRemoveCollection/index.skeleton';
import Skeleton from 'react-loading-skeleton';
import { fetch, getCacheKey } from '../../../utils';
import { Collection } from '../../../types';
import useSWRInfinite from 'swr/infinite';
import searchLogo from '../../../assets/undraw_searching_re_3ra9.svg';
import toast from 'react-hot-toast';
const AddToCollection: React.FC<{ photoId: string }> = (props) => {
  const [query, setQuery] = useState<string>('');
  const { data, isLoading, setSize } = useSWRInfinite<{
    pages: number;
    total: number;
    results: Array<Omit<Collection, 'previews'>>;
  }>(
    (index: number) => {
      if (query !== '') {
        return getCacheKey('getSearchCollection', {
          page: index + 1,
          limit: 10,
          photoId: props.photoId,
          query: query,
        });
      } else {
        return null;
      }
    },
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
  const { pageCount, setPage, containerRef } = usePageCount(90);
  const ref = useRef<React.ElementRef<'input'>>(null);

  useEffect(() => {
    setSize(pageCount);
  }, [pageCount, setSize]);

  const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const value = (ref.current as React.ElementRef<'input'>).value.trim();
    if (value !== '' && query !== value) {
      setQuery(value);
      setPage((page) => ({
        ...page,
        count: 1,
      }));
    }
  };
  const collections = data?.map((collection) => collection.results).flat();
  return (
    <Modal className={style['add-collection-modal']}>
      <h1>Add to Collection</h1>
      <form onSubmit={onSubmitHandler} style={{ width: '100%' }}>
        <SearchBox placeholder="Enter your keyboards..." name="search" ref={ref} />
      </form>
      {query !== '' ? (
        <>
          {!isLoading && Array.isArray(data) && data.length > 0 ? (
            <span>{data[data.length - 1].total} matches</span>
          ) : (
            <Skeleton style={{ width: '120px', height: '20px' }} />
          )}
          {!isLoading && Array.isArray(collections) ? (
            <AddRemoveCollection action="add" collections={collections} photoId={props.photoId} ref={containerRef} />
          ) : (
            <AddRemoveCollectionSkeleton colCount={5} action="add" />
          )}
        </>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3rem',
          }}
        >
          <img src={searchLogo} alt="search log" style={{ margin: '10% auto 0px', width: '40%', height: 'auto' }} />
          <span style={{ fontSize: '16px', fontWeight: '500', fontFamily: 'inherit' }}>Search Collection</span>
        </div>
      )}
    </Modal>
  );
};

export default AddToCollection;
