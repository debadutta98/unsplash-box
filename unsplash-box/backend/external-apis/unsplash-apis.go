package api

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/debadutta98/unsplash-box/backend/utils"
)

type order string

const (
	Latest  order = "latest"
	Oldest  order = "oldest"
	Popular order = "popular"
)

// fetch photo
func FetchPhoto(photo_id string) (*http.Response, error) {

	endpoint := utils.BuildUrl(utils.URL{
		BaseURL: os.Getenv("BASE_URL"),
		Url:     "/photos/" + photo_id,
		Params: map[string]string{
			"client_id": os.Getenv("ACCESS_KEY"),
		},
	})

	return http.Get(endpoint)
}

// search photos by title
func SearchPhoto(query string, page int, limit int) (*http.Response, error) {

	endpoint := utils.BuildUrl(utils.URL{
		BaseURL: os.Getenv("BASE_URL"),
		Url:     "/search/photos",
		Params: map[string]string{
			"query":     query,
			"client_id": os.Getenv("ACCESS_KEY"),
			"page":      strconv.Itoa(page),
			"per_page":  strconv.Itoa(limit),
		},
	})

	return http.Get(endpoint)
}

// fetch collection
func FetchCollection(collection_id string) (*http.Response, error) {

	endpoint := utils.BuildUrl(utils.URL{
		BaseURL: os.Getenv("BASE_URL"),
		Url:     "/collections/" + collection_id,
		Params: map[string]string{
			"client_id": os.Getenv("ACCESS_KEY"),
		},
	})

	fmt.Println(endpoint)

	return http.Get(endpoint)
}

// search collection by title
func SearchCollection(query string, page int, limit int) (*http.Response, error) {

	endpoint := utils.BuildUrl(utils.URL{
		BaseURL: os.Getenv("BASE_URL"),
		Url:     "/search/collections",
		Params: map[string]string{
			"client_id": os.Getenv("ACCESS_KEY"),
			"query":     query,
			"page":      strconv.Itoa(page),
			"per_page":  strconv.Itoa(limit),
		},
	})

	return http.Get(endpoint)
}
