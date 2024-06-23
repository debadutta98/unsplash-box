package routes

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strings"
	"sync"

	"github.com/debadutta98/unsplash-box/backend/db"
	api "github.com/debadutta98/unsplash-box/backend/external-apis"
	"github.com/debadutta98/unsplash-box/backend/utils"
	"github.com/gin-gonic/gin"
)

func getPhotos(context *gin.Context) {

	photoId := context.Param("photoId")

	if strings.EqualFold(photoId, "") {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "photoId must n't be empty"})
		return
	}

	res, err := api.FetchPhoto(photoId)

	if err != nil {
		context.AbortWithStatusJSON(res.StatusCode, gin.H{"message": err.Error()})
		return
	}

	defer res.Body.Close()

	context.DataFromReader(res.StatusCode, res.ContentLength, res.Header.Get("Content-Type"), res.Body, nil)
}

func searchPhoto(context *gin.Context) {

	page, isPagePresent := context.GetQuery("page")
	limit, isLimitPresent := context.GetQuery("limit")
	query, _ := context.GetQuery("query")

	parsedLimit, isLimitNum := utils.IsNumber(limit)
	parsedPage, isPageNum := utils.IsNumber(page)

	if !isPagePresent || !isPageNum {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "page is must be present"})
		return
	} else {
		if parsedPage <= 0 {
			context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "page must be greater than 0"})
			return
		}
	}

	if !isLimitPresent || !isLimitNum {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "limit is must be present"})
		return
	} else {
		if parsedLimit <= 0 {
			context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "limit must be greater than 0"})
			return
		}
	}

	res, err := api.SearchPhoto(query, parsedPage, parsedLimit)

	if err != nil {
		context.AbortWithStatusJSON(res.StatusCode, gin.H{"message": err.Error()})
		return
	}

	defer res.Body.Close()

	context.DataFromReader(res.StatusCode, res.ContentLength, res.Header.Get("Content-Type"), res.Body, nil)
}

func getCollections(context *gin.Context) {

	page, isPagePresent := context.GetQuery("page")

	limit, isLimitPresent := context.GetQuery("limit")

	photo_id, isPhotoIdPresent := context.GetQuery("photo_id")

	parsedLimit, isLimitNum := utils.IsNumber(limit)
	parsedPage, isPageNum := utils.IsNumber(page)

	if !isPagePresent || !isPageNum {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "page is must be present"})
		return
	} else {
		if parsedPage <= 0 {
			context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "page must be greater than 0"})
			return
		}
	}

	if !isLimitPresent || !isLimitNum {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "limit is must be present"})
		return
	} else {
		if parsedLimit <= 0 {
			context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "limit must be greater than 0"})
			return
		}
	}

	collections := make(chan []map[string]interface{}, 1)
	collectionsCount := make(chan int, 1)

	go func() {
		count, err := db.GetCollectionsCount(photo_id)
		collectionsCount <- count
		if err != nil {
			context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "Error while fetch the collections count"})
			return
		}
	}()

	go func() {
		results, err := db.GetAllCollection([]string{}, parsedPage, parsedLimit, photo_id)
		collections <- results
		if err != nil {
			context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "Error while fetch the collections"})
			return
		}
	}()

	defer close(collections)
	defer close(collectionsCount)

	count := <-collectionsCount
	gallery := <-collections

	if context.IsAborted() {
		return
	}

	skip, lim := utils.GetSkipLimit(parsedPage, parsedLimit)
	pageCount := math.Ceil(float64(count) / float64(parsedLimit))
	remainingPages := max(count-skip, 0) / lim
	available := remainingPages > 0

	for _, collection := range gallery {
		photos := make([]interface{}, 0)
		images, err := json.Marshal(collection["photos"])
		if err != nil {
			context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
		err = json.Unmarshal(images, &photos)
		if err != nil {
			context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		collection["total_photos"] = len(photos)

		if !isPhotoIdPresent {
			previews := make([]interface{}, 0)
			var imgs []interface{}
			if len(photos) >= 3 {
				imgs = photos[0:3]
			} else {
				imgs = photos[0:]
			}
			for _, photo := range imgs {
				previews = append(previews, photo.(map[string]interface{})["urls"])
			}
			collection["previews"] = previews
		}

		delete(collection, "photos")
	}

	gallery = utils.Filter(gallery, func(v map[string]interface{}, i int) bool {
		if v, ok := v["total_photos"]; ok && v.(int) > 0 {
			return true
		} else {
			return false
		}
	})

	data, err := json.Marshal(gin.H{"results": gallery, "pages": pageCount, "remainingPages": remainingPages, "available": available})

	if err != nil {
		context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	reader := bytes.NewReader(data)

	context.DataFromReader(http.StatusOK, reader.Size(), "application/json", reader, nil)
}

func searchCollection(context *gin.Context) {

	page, isPagePresent := context.GetQuery("page")
	limit, isLimitPresent := context.GetQuery("limit")
	query, isQueryPresent := context.GetQuery("query")
	photo_id, isPhotoIdPresent := context.GetQuery("photo_id")

	parsedLimit, isLimitNum := utils.IsNumber(limit)
	parsedPage, isPageNum := utils.IsNumber(page)

	if !isPagePresent || !isPageNum {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "page is must be present"})
		return
	} else {
		if parsedPage <= 0 {
			context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "page must be greater than 0"})
			return
		}
	}

	if !isLimitPresent || !isLimitNum {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "limit is must be present"})
		return
	} else {
		if parsedLimit <= 0 {
			context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "limit must be greater than 0"})
			return
		}
	}

	if !isQueryPresent {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "query is missing"})
		return
	}

	searchedCollections := make([]map[string]interface{}, 0)
	pCount := parsedPage
	total := 0

	skip, lim := utils.GetSkipLimit(parsedPage, parsedLimit)

	for len(searchedCollections) < parsedLimit {

		res, err := api.SearchCollection(query, pCount, parsedLimit)

		if err != nil {
			context.AbortWithStatusJSON(res.StatusCode, gin.H{"message": err.Error()})
			return
		}

		data := make(map[string]interface{})

		err = json.NewDecoder(res.Body).Decode(&data)

		if err != nil {
			context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		err = res.Body.Close()

		if err != nil {
			context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}

		collection_ids := make([]string, 0)

		for _, result := range data["results"].([]interface{}) {
			id := result.(map[string]interface{})["id"].(string)
			collection_ids = append(collection_ids, id)
		}

		set := make(map[string]bool, 0)

		if isPhotoIdPresent {
			collections, err := db.GetAllCollection(collection_ids, 0, 0, photo_id)

			if err != nil {
				context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
				return
			}

			for _, collection := range collections {
				id := collection["id"].(string)
				set[id] = true
			}
		}

		if total == 0 {
			total = int(data["total"].(float64))
		}

		for _, result := range data["results"].([]interface{}) {
			r := result.(map[string]interface{})
			_, ok := set[r["id"].(string)]
			if skip > 0 {
				if !ok {
					skip--
				} else {
					skip++
					total--
				}
				continue
			}
			if !ok && len(searchedCollections) < parsedLimit {
				searchedCollections = append(searchedCollections, r)
			} else if len(searchedCollections) >= parsedLimit {
				break
			}
		}

		total_pages := int(data["total_pages"].(float64))

		if total_pages > pCount {
			pCount++
		} else {
			break
		}
	}

	pick_up_keys := []string{"id", "title", "cover_photo", "description"}

	for _, result := range searchedCollections {
		utils.PickUpKeys(result, pick_up_keys)
	}

	excludedCollectionIds := make([]string, 0, len(searchedCollections))

	for _, coll := range searchedCollections {
		id := coll["id"].(string)
		excludedCollectionIds = append(excludedCollectionIds, id)
	}

	collections, err := db.GetAllCollection(excludedCollectionIds, 0, 0, "")

	if err != nil {
		context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	set := make(map[string]interface{}, len(collections))

	for _, coll := range collections {
		id := coll["id"].(string)
		set[id] = coll
	}

	for _, result := range searchedCollections {
		result["urls"] = result["cover_photo"].(map[string]interface{})["urls"]
		delete(result, "cover_photo")
		if collection, ok := set[result["id"].(string)]; ok {
			photos := make([]interface{}, 0)
			images, err := json.Marshal(collection.(map[string]interface{})["photos"])
			if err != nil {
				context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
				return
			}
			err = json.Unmarshal(images, &photos)
			if err != nil {
				context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
				return
			}
			result["total_photos"] = len(photos)
		} else {
			result["total_photos"] = 0
		}
	}

	pages := math.Ceil(float64(total) / float64(parsedLimit))
	remainingPages := max(total-skip, 0) / lim
	available := remainingPages > 0

	data, err := json.Marshal(gin.H{"results": searchedCollections, "total": total, "pages": pages, "available": available, "remainingPages": remainingPages})

	if err != nil {
		context.AbortWithStatusJSON(http.StatusInternalServerError, err.Error())
	}

	reader := bytes.NewReader(data)

	context.DataFromReader(http.StatusOK, reader.Size(), "application/json", reader, nil)
}

func addCollection(context *gin.Context) {

	body := make(map[string]interface{})

	err := json.NewDecoder(context.Request.Body).Decode(&body)

	if err != nil {
		context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	expected_keys := []string{"collection_id", "photo_id"}

	for _, key := range expected_keys {
		if _, ok := body[key]; !ok {
			context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": fmt.Sprintf("%s must be present", key)})
			return
		}
	}

	data := sync.Map{}

	wait := sync.WaitGroup{}

	wait.Add(2)

	go func(w *sync.WaitGroup, d *sync.Map) {
		defer w.Done()
		res, err := api.FetchPhoto(body["photo_id"].(string))
		if res.StatusCode > 299 || res.StatusCode < 200 {
			context.AbortWithStatusJSON(res.StatusCode, gin.H{"message": http.StatusText(res.StatusCode)})
			return
		}
		if err != nil {
			context.AbortWithStatusJSON(res.StatusCode, gin.H{"message": "Error while fetch the image information"})
			return
		}
		defer res.Body.Close()
		data := make(map[string]interface{})
		err = json.NewDecoder(res.Body).Decode(&data)
		if err != nil {
			context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "Error while parsing image information"})
			return
		}
		pick_keys := []string{"id", "urls", "width",
			"height", "created_at", "updated_at",
			"promoted_at", "color", "blur_hash",
			"description", "alt_description", "links",
			"user"}
		utils.PickUpKeys(data, pick_keys)
		d.Store("photo", data)
	}(&wait, &data)

	go func(w *sync.WaitGroup, d *sync.Map) {
		defer w.Done()
		res, err := api.FetchCollection(body["collection_id"].(string))
		if res.StatusCode > 299 || res.StatusCode < 200 {
			context.AbortWithStatusJSON(res.StatusCode, gin.H{"message": http.StatusText(res.StatusCode)})
			return
		}
		if err != nil {
			context.AbortWithStatusJSON(res.StatusCode, gin.H{"message": "Error while fetch the collection information"})
			return
		}
		defer res.Body.Close()
		data := make(map[string]interface{})
		err = json.NewDecoder(res.Body).Decode(&data)
		if err != nil {
			context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": "Error while parsing collection information"})
			return
		}
		pick_keys := []string{"id", "title", "cover_photo", "description"}
		utils.PickUpKeys(data, pick_keys)
		data["urls"] = data["cover_photo"].(map[string]interface{})["urls"]
		delete(data, "cover_photo")
		d.Store("collection", data)
	}(&wait, &data)

	wait.Wait()

	if context.IsAborted() {
		return
	}

	collection, ok := data.LoadAndDelete("collection")

	if !ok {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "Collection not found"})
		return
	}
	photo, ok := data.LoadAndDelete("photo")
	if !ok {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "Photo not found"})
		return
	}

	isInserted, err := db.AddPhotoToCollection(collection.(map[string]interface{}), photo.(map[string]interface{}))
	response := make(map[string]string)
	var code int
	if isInserted {
		code = http.StatusOK
		response["message"] = "Photo is removed from collection"
	} else {
		code = http.StatusBadRequest
		response["message"] = err.Error()
	}
	res, _ := json.Marshal(response)
	context.Data(code, "application/json", res)
}

func removeCollection(context *gin.Context) {
	body := make(map[string]interface{})

	err := json.NewDecoder(context.Request.Body).Decode(&body)

	if err != nil {
		context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	expected_keys := []string{"collection_id", "photo_id"}

	for _, key := range expected_keys {
		if _, ok := body[key]; !ok {
			context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": fmt.Sprintf("%s must be present", key)})
			return
		}
	}

	isUpdated, err := db.RemovePhotoFromCollection(body["collection_id"].(string), body["photo_id"].(string))

	response := make(map[string]string)
	var code int
	if isUpdated {
		code = http.StatusOK
		response["message"] = "Photo is removed from collection"
	} else {
		code = http.StatusBadRequest
		response["message"] = err.Error()
	}

	res, _ := json.Marshal(response)

	context.Data(code, "application/json", res)
}

func getCollectionsPhotos(context *gin.Context) {
	page, isPagePresent := context.GetQuery("page")

	limit, isLimitPresent := context.GetQuery("limit")

	parsedLimit, isLimitNum := utils.IsNumber(limit)
	parsedPage, isPageNum := utils.IsNumber(page)

	collectionId := context.Param("collectionId")

	if !isPagePresent || !isPageNum {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "page is must be present"})
		return
	} else {
		if parsedPage <= 0 {
			context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "page must be greater than 0"})
			return
		}
	}

	if !isLimitPresent || !isLimitNum {
		context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "limit is must be present"})
		return
	} else {
		if parsedLimit <= 0 {
			context.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"message": "limit must be greater than 0"})
			return
		}
	}

	photos, err := db.GetPhotosOfCollection(collectionId, parsedPage, parsedLimit)

	if err != nil {
		context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	total_photos := photos["total_photos"].(int32)

	skip, lim := utils.GetSkipLimit(parsedPage, parsedLimit)

	photos["pages"] = math.Ceil(float64(total_photos) / float64(parsedLimit))
	remainingPages := max(int(total_photos)-int(skip), 0) / lim
	photos["available"] = remainingPages > 0
	photos["remainingPages"] = remainingPages

	data, err := json.Marshal(photos)

	if err != nil {
		context.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	reader := bytes.NewReader(data)

	context.DataFromReader(http.StatusOK, reader.Size(), "application/json", reader, nil)
}
