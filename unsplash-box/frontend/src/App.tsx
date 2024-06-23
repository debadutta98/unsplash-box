import { Route, Routes } from 'react-router-dom';
import Headers from './components/Headers';
import Home from './screens/Home';
import ImageDetails from './screens/ImageDetails';
import Collections from './screens/Collections';
import CollectionList from './screens/CollectionList';
import CollectionImages from './screens/CollectionImages';
import PageNotFound from './screens/PageNotFound';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
function App() {
  useEffect(() => {
    const connected = () => {
      toast.success('You are now connected to the internet');
    };
    const disconnected = () => {
      toast.error('You have been disconnected from the internet.');
    };
    window.addEventListener('online', connected);
    window.addEventListener('offline', disconnected);
    return () => {
      window.removeEventListener('online', connected);
      window.removeEventListener('offline', disconnected);
    };
  }, []);
  return (
    <>
      <Headers />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/details/:photoId" element={<ImageDetails />} />
        <Route path="/collections" element={<Collections />}>
          <Route index element={<CollectionList />} />
          <Route path=":collectionId" element={<CollectionImages />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
