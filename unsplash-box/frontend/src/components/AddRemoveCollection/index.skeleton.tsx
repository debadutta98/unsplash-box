import Skeleton from 'react-loading-skeleton';
import style from './index.module.sass';
import addIcon from '../../assets/Plus.svg';
import removeIcon from '../../assets/Remove.svg';

const AddRemoveCollectionSkeleton: React.FC<{
  colCount: number;
  action: 'add' | 'remove';
}> = (props) => {
  const action = props.action === 'add' ? 'Add to Collection' : 'Remove';
  const icon = props.action === 'add' ? addIcon : removeIcon;

  return (
    <ul className={style['collections-list']}>
      {Array.from({ length: props.colCount }).map((_, index) => (
        <li key={`act-${action}-` + index} className={style['list-item']}>
          <div className={style['item-details']}>
            <Skeleton style={{ width: '6rem', aspectRatio: '1/1', borderRadius: '8px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Skeleton style={{ height: '20px', width: '5rem' }} />
              <Skeleton style={{ height: '18px', width: '3rem' }} />
            </div>
          </div>
          <button className={style['action-btn']} type="button">
            <img src={icon} alt="action-icon" />
            {action}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default AddRemoveCollectionSkeleton;
