import { useCallback, useRef, useState } from 'react';
let timeoutId: number;
function usePageCount(threshold: number) {
  const [page, setPage] = useState<{ count: number; pageLimit: number }>({
    count: 1,
    pageLimit: Infinity,
  });
  const ref = useRef<HTMLElement | null>(null);
  const containerRef = useCallback((node: HTMLElement | null) => {
    const onScrollHandler = () => {
      const element = ref.current;
      if (element) {
        const percentage = Math.round((element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100);
        if (percentage >= threshold) {
          clearInterval(timeoutId);
          timeoutId = setTimeout(() => {
            setPage((prevState) => {
              const count = prevState.count + 1;
              if (prevState.count < prevState.pageLimit) {
                return {
                  ...prevState,
                  count,
                };
              } else if (prevState.count > prevState.pageLimit) {
                return {
                  ...prevState,
                  count: prevState.pageLimit,
                };
              }
              return prevState;
            });
          }, 500);
        }
      }
    };
    ref.current?.removeEventListener('scroll', onScrollHandler);
    if (node) {
      ref.current = node;
    }
    ref.current?.addEventListener('scroll', onScrollHandler, { passive: true });
  }, []);

  if (!ref.current) {
    containerRef(document.querySelector('body'));
  }

  return {
    pageCount: page.count,
    setPage,
    containerRef,
  };
}
export default usePageCount;
