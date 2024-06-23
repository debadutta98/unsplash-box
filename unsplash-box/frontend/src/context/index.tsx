import { createContext, useState } from 'react';
import { ContextState } from '../types';

export const context = createContext<ContextState>({
  imgQuery: '',
  setImgQuery: () => undefined,
  isModalOpen: false,
  openModal: () => undefined,
  closeModal: () => undefined,
  toggleModal: () => undefined,
});

const Provider: React.FC<{ children: React.ReactNode }> = function ({ children }) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [imgQuery, setImgQuery] = useState<string>('');
  return (
    <context.Provider
      children={children}
      value={{
        isModalOpen,
        imgQuery,
        setImgQuery,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
        toggleModal: () => setIsModalOpen(!isModalOpen),
      }}
    />
  );
};

export default Provider;
