import React from 'react';
import { AddRemoveCollectionProps } from '../../types';
import addIcon from '../../assets/Plus.svg';
import removeIcon from '../../assets/Remove.svg';
import style from './index.module.sass';
import { AxiosRequestConfig } from 'axios';
import NoResultsFound from '../NoResultFound';
import useSWRMutation from 'swr/mutation';
import { fetch } from '../../utils';
import { useSWRConfig } from 'swr';
import toast from 'react-hot-toast';
const AddRemoveCollection: React.FC<AddRemoveCollectionProps & React.HTMLProps<HTMLUListElement>> = React.forwardRef(
  ({ className, action, collections, photoId, ...props }, ref) => {
    const { trigger: addCollection } = useSWRMutation<object, Error, string, AxiosRequestConfig>(
      '/collections/add',
      (key, { arg }) => fetch(key, { method: 'post', ...arg })
    );
    const { trigger: removeCollection } = useSWRMutation<object, Error, string, AxiosRequestConfig>(
      '/collections/remove',
      (key, { arg }) => fetch(key, { method: 'Delete', ...arg })
    );
    const { cache, mutate } = useSWRConfig();
    const onClickActionHandler = (collection_id: string, photo_id: string) => {
      const data = {
        collection_id,
        photo_id,
      };
      const promise = action === 'add' ? addCollection({ data }) : removeCollection({ data });
      promise
        .then(() => {
          if (action === 'add') {
            toast.success('Successfully added the image to the collection');
          } else {
            toast.success(`Image successfully removed from the collection`);
          }
          for (const key of cache.keys()) {
            if (typeof key === 'string' && key.includes(`photo_id=${photo_id}`)) {
              mutate(key);
            }
          }
        })
        .catch(() => {
          toast.error(`Error while trying to ${action === 'add' ? 'add to' : 'remove from'} the collection`);
        });
    };
    const icon = action === 'add' ? addIcon : removeIcon;
    const actionText = action === 'add' ? 'Add to Collection' : 'Remove';
    return (
      <ul
        className={className ? className + ' ' + style['collections-list'] : style['collections-list']}
        {...props}
        ref={ref}
      >
        {Array.isArray(collections) && collections.length > 0 ? (
          collections.map((collection) => (
            <li key={`${action}-${collection.id}`} className={style['list-item']}>
              <div className={style['item-details']}>
                <img src={collection.urls.small} alt={collection.title} />
                <div className={style['item-info']}>
                  <span className={style['item-info-title']}>{collection.title}</span>
                  <span className={style['item-info-count']}>{collection.total_photos} photos</span>
                </div>
              </div>
              <button onClick={onClickActionHandler.bind(null, collection.id, photoId)} className={style['action-btn']}>
                <img src={icon} alt="action-icon" />
                {actionText}
              </button>
            </li>
          ))
        ) : (
          <li style={{ width: '40%', display: 'flex', margin: 'auto' }}>
            <NoResultsFound />
          </li>
        )}
      </ul>
    );
  }
);

export default AddRemoveCollection;
