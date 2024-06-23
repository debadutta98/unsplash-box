const paths: { [key: string]: string } = {
  getSearchCollection: '/collections/search?page=:page&limit=:limit&photo_id=:photoId&query=:query',
  getCollectionImages: '/collections/:collectionId?page=1&limit=10',
  getPhoto: '/photos/:photoId',
  getPhotoCollections: '/collections?page=:page&limit=:limit&photo_id=:photoId',
  getSearchImages: '/photos/search?page=:page&limit=:limit&query=:query',
  getAllCollections: '/collections?page=:page&limit=:limit',
};

export default paths;
