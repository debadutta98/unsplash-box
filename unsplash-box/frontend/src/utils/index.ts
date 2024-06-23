import axios, { AxiosRequestConfig } from 'axios';
import paths from './paths';
import toast from 'react-hot-toast';
const baseURL = import.meta.env.VITE_APP_URL;

export const getCacheKey = (path: string, params: { [key: string]: string | number }) => {
  let url = paths[path];
  for (const key in Object.create(params)) {
    url = url.replace(`:${key}`, params[key].toString());
  }
  return url;
};

export const fetch = (url: string, options?: AxiosRequestConfig) => {
  return axios({
    baseURL,
    url,
    method: 'GET',
    ...options,
    validateStatus: (status) => status > 199 && status < 300,
  }).then((res) => res.data);
};

export const downloadImage = (imageUrl: string, fileName: string) => {
  toast.promise(
    axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'blob',
      validateStatus: (status) => status > 199 && status < 300,
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }),
    {
      loading: 'Download in progress...',
      success: 'File downloaded successfully',
      error: 'An error occurred during the download',
    }
  );
};
