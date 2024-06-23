package utils

import (
	"fmt"
	"maps"
	"net/url"
	"strconv"
)

type URL struct {
	BaseURL string
	Url     string
	Params  map[string]string
}

func IsNumber(s string) (int, bool) {
	num, err := strconv.Atoi(s)
	if err != nil {
		return 0, false
	}
	return num, true
}

func BuildUrl(u URL) string {
	query := url.Values{}
	for key := range u.Params {
		query.Add(key, u.Params[key])
	}
	return fmt.Sprintf("%s%s?%s", u.BaseURL, u.Url, query.Encode())
}

func GetSkipLimit(page int, limit int) (int, int) {
	skip := (page - 1) * limit
	limit = page * limit
	return skip, limit
}

func PickUpKeys(m map[string]interface{}, keys []string) {
	set := make(map[string]bool)
	for _, key := range keys {
		set[key] = true
	}
	maps.DeleteFunc(m, func(key string, _ interface{}) bool {
		if _, ok := set[key]; !ok {
			return true
		} else {
			return false
		}
	})
}

func Find[T comparable](a []T, s T) int {
	fmt.Println(a, s)
	for index, ele := range a {
		fmt.Println(ele, s)
		if ele == s {
			return index
		}
	}
	return -1
}

func Filter[E interface{}](a []E, fn func(v E, i int) bool) []E {
	newArr := make([]E, 0)
	for i, v := range a {
		if fn(v, i) {
			newArr = append(newArr, v)
		}
	}
	return newArr
}
