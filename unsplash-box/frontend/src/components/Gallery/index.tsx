import React from 'react';
import style from './index.module.sass';
import { GalleryProps } from '../../types';
const Gallery: React.FC<GalleryProps & React.HTMLProps<HTMLDivElement>> = ({ className, colCount, ...props }) => {
  colCount = colCount || 4;
  const gridItems: Array<Array<React.ReactNode>> = [];
  React.Children.forEach(props.children, (child, i) => {
    if (Array.isArray(gridItems[i % colCount])) {
      gridItems[i % colCount].push(child);
    } else {
      gridItems[i % colCount] = [child];
    }
  });
  return (
    <div className={className ? className + ' ' + style['grid-layout'] : style['grid-layout']} {...props}>
      {gridItems.map((items, index) => (
        <div className={style['grid-item']} key={'item-' + index}>
          {items.map((child, index) => (
            <React.Fragment key={'c-' + index}>{child}</React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Gallery;
