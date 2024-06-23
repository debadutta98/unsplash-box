export type NavLinkStyle = {
  isActive: boolean;
  isPending: boolean;
  isTransitioning: boolean;
};

export type changeNavStypeFunc = (state: NavLinkStyle) => string;

export interface SearchBoxProps {
  placeholder: string;
  name: string;
}

export interface ImageProps {
  placeholder: string;
  src: string;
}

export interface GalleryProps {
  colCount: number;
}

export interface ContextState {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
  imgQuery: string;
  setImgQuery: (query: string) => void;
}

export interface AddRemoveCollectionProps {
  action: 'add' | 'remove';
  collections: Array<Omit<Collection, 'previews'>>;
  photoId: string;
}

export interface Urls {
  full: string;
  raw: string;
  small: string;
  thumb: string;
  regular: string;
}

export interface Photo {
  id: string;
  alt_description: string;
  urls: Urls;
  blur_hash: string;
  width: number;
  height: number;
}

export interface Collection {
  id: string;
  previews: Array<Urls>;
  title: string;
  total_photos: number;
  description: string;
  urls: Urls;
}

export interface CollectionResponse {
  id: string;
  photos: Array<Photo>;
  title: string;
  total_photos: string;
}

export interface CollectionState {
  title: string | undefined;
  subTitle: string | undefined;
}
