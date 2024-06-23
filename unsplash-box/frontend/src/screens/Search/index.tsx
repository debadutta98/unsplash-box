import { useContext, useEffect, useRef } from 'react';
import bgGradiend from '../../../src/assets/gradiend-bg@2x.png';
import SearchBox from '../../components/SearchBox';
import style from './index.module.sass';
import Gallery from '../../components/Gallery';
import { context } from '../../context';
import usePageCount from '../../hooks/usePageCount';
import { Photo } from '../../types';
import ImageItem from '../../components/ImageItem';
import { fetch, getCacheKey } from '../../utils';
import ImageItemSkeleton from '../../components/ImageItem/index.skeleton';
import NoResultsFound from '../../components/NoResultFound';
import useSWRInfinite from 'swr/infinite';
import toast from 'react-hot-toast';

function Search() {
  const { pageCount, setPage } = usePageCount(90);
  const { imgQuery, setImgQuery } = useContext(context);
  const { data, isLoading, setSize } = useSWRInfinite<{
    results: Array<Photo>;
    total_pages: number;
  }>(
    (index: number) => {
      if (imgQuery !== '') {
        return getCacheKey('getSearchImages', { page: index + 1, limit: 10, query: imgQuery });
      } else {
        return null;
      }
    },
    fetch,
    {
      revalidateAll: true,
      parallel: true,
      revalidateFirstPage: false,
      initialSize: 0,
      onSuccess(data) {
        if (Array.isArray(data) && data.length > 0) {
          const lastPageResult = data[data.length - 1];
          setPage((pages) => ({
            ...pages,
            pageLimit: lastPageResult.total_pages,
          }));
        }
      },
      onError() {
        toast.error('Error occurred while fetching the page');
      },
    }
  );
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSize(pageCount);
  }, [pageCount, setSize]);

  const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const value = (ref.current as HTMLInputElement).value.trim();
    if (value !== '' && value !== imgQuery) {
      setImgQuery(value);
      setPage((page) => ({ ...page, count: 1 }));
    }
  };
  const results = data?.map((value) => value.results).flat();
  return (
    <div className={style['search-screen-ctn']}>
      <div className={style['search-bar-ctn']}>
        <img src={bgGradiend} className={style['img']} />
        <form onSubmit={onSubmitHandler}>
          <SearchBox
            placeholder="Enter your keyboards..."
            name="search"
            className={style['search-input']}
            ref={ref}
            defaultValue={imgQuery}
          />
        </form>
      </div>
      {isLoading ? (
        <Gallery colCount={4}>
          {Array.from({ length: 10 }).map((_, index) => (
            <ImageItemSkeleton key={'imageItem-' + index} />
          ))}
        </Gallery>
      ) : Array.isArray(results) && results.length > 0 ? (
        <Gallery colCount={4}>
          {results.map((image) => (
            <ImageItem image={image} key={image.id} />
          ))}
        </Gallery>
      ) : (
        <div style={{ width: '30%', display: 'flex', margin: 'auto' }}>
          <NoResultsFound />
        </div>
      )}
    </div>
  );
}

export default Search;
