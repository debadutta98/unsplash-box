package routes

import (
	"github.com/gin-gonic/gin"
)

func Registerv1Router(app *gin.Engine) {
	router := app.Group("/api/1.1/")

	router.GET("/photos/:photoId", getPhotos)
	router.GET("/photos/search", searchPhoto)

	router.GET("/collections", getCollections)
	router.GET("/collections/:collectionId", getCollectionsPhotos)
	router.GET("/collections/search", searchCollection)
	router.POST("/collections/add", addCollection)
	router.DELETE("/collections/remove", removeCollection)
	router.GET("/collections/photos", getCollectionsPhotos)
}
