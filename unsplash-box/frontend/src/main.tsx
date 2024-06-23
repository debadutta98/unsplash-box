import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './index.sass';
import Provider from './context/index.tsx';
import 'react-loading-skeleton/dist/skeleton.css';
import { Toaster } from 'react-hot-toast';
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={'home'} />,
  },
  {
    path: '/*',
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider>
    <Toaster position="top-right" reverseOrder={false} containerStyle={{ top: '8%' }} />
    <RouterProvider router={router} />
  </Provider>
);
