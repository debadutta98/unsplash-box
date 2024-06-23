/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import style from './index.module.sass';
import { context } from '../../context';

const Modal: React.FC<React.HTMLProps<HTMLDivElement>> = ({ children, className, ...props }) => {
  const { closeModal } = useContext(context);
  useEffect(() => {
    const onKeyDownEventHandler: (event: KeyboardEvent) => void = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', onKeyDownEventHandler);
    return () => {
      document.removeEventListener('keydown', onKeyDownEventHandler);
    };
  }, []);

  return createPortal(
    <>
      <div className={style['overlay']} onClick={() => closeModal()}></div>
      <div className={className ? className + ' ' + style['modal'] : style['modal']} {...props}>
        {children}
      </div>
    </>,
    document.querySelector('#modal') as Element
  );
};

export default Modal;
