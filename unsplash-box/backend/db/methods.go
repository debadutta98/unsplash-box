package db

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/debadutta98/unsplash-box/backend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func AddPhotoToCollection(c map[string]interface{}, p map[string]interface{}) (bool, error) {
	collection := Client.Database(os.Getenv("DATABASE_NAME")).Collection("collection")
	ctx, cancel := context.WithTimeoutCause(context.TODO(), 3*time.Second, errors.New("operation timeout"))
	defer cancel()
	count, err := collection.CountDocuments(ctx, bson.D{{Key: "id", Value: c["id"]}})
	if err != nil {
		return false, err
	}
	if count > 0 {
		result := collection.FindOne(ctx, bson.D{{Key: "id", Value: c["id"]}, {Key: "photos", Value: bson.D{{Key: "$elemMatch", Value: bson.D{{Key: "id", Value: p["id"]}}}}}})
		raw, _ := result.Raw()
		if raw != nil {
			if id, ok := raw.Lookup("id").StringValueOK(); ok && id != "" {
				return false, errors.New("photo already exist")
			}
		}
		_, err = collection.UpdateOne(ctx, bson.D{{Key: "id", Value: c["id"]}}, bson.D{{Key: "$push", Value: bson.D{{Key: "photos", Value: p}}}})
		if err != nil {
			return false, err
		}
	} else {
		c["photos"] = bson.A{p}
		_, err = collection.InsertOne(ctx, c)
		if err != nil {
			return false, err
		}
	}
	return true, nil
}

func RemovePhotoFromCollection(collection_id string, photo_id string) (bool, error) {
	collection := Client.Database(os.Getenv("DATABASE_NAME")).Collection("collection")
	ctx, cancel := context.WithTimeoutCause(context.TODO(), 3*time.Second, errors.New("operation timeout"))
	defer cancel()
	_, err := collection.UpdateOne(ctx, bson.D{{Key: "id", Value: collection_id}}, bson.D{{Key: "$pull", Value: bson.D{{Key: "photos", Value: bson.D{{Key: "id", Value: photo_id}}}}}})
	if err != nil {
		return false, err
	}
	return true, nil
}

func GetAllCollection(collection_ids []string, page int, limit int, photo_id string) ([]map[string]interface{}, error) {
	collection := Client.Database(os.Getenv("DATABASE_NAME")).Collection("collection")
	s, l := utils.GetSkipLimit(page, limit)
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$project", Value: bson.D{{Key: "_id", Value: 0}}}},
		bson.D{{Key: "$match", Value: bson.D{
			{Key: "$expr", Value: bson.D{
				{Key: "$gt", Value: bson.A{
					bson.D{{Key: "$size", Value: "$photos"}},
					0,
				}},
			}},
		}}},
	}
	if len(collection_ids) > 0 {
		pipeline = append(pipeline, bson.D{{Key: "$match", Value: bson.D{{Key: "id", Value: bson.D{{Key: "$in", Value: collection_ids}}}}}})
	}
	if photo_id != "" {
		pipeline = append(pipeline, bson.D{{Key: "$match", Value: bson.D{{Key: "photos", Value: bson.D{{Key: "$elemMatch", Value: bson.D{{Key: "id", Value: photo_id}}}}}}}})
	}
	if l > 0 {
		pipeline = append(pipeline, bson.D{{Key: "$limit", Value: l}})
	}
	if s > 0 {
		pipeline = append(pipeline, bson.D{{Key: "$skip", Value: s}})
	}
	ctx, cancel := context.WithTimeoutCause(context.TODO(), 3*time.Second, errors.New("operation timout"))
	defer cancel()
	val := make([]map[string]interface{}, 0)
	cur, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return val, err
	}
	err = cur.All(ctx, &val)
	return val, err
}

func GetPhotosOfCollection(collection_id string, page int, limit int) (map[string]interface{}, error) {
	collection := Client.Database(os.Getenv("DATABASE_NAME")).Collection("collection")
	s, l := utils.GetSkipLimit(page, limit)
	ctx, cancel := context.WithTimeoutCause(context.TODO(), 3*time.Second, errors.New("operation timeout"))
	defer cancel()
	result := make(map[string]interface{})
	doc := collection.FindOne(ctx, bson.D{{Key: "id", Value: collection_id}}, options.FindOne().SetProjection(bson.D{{Key: "total_photos", Value: bson.D{{Key: "$size", Value: "$photos"}}}, {Key: "photos", Value: bson.D{{Key: "$slice", Value: bson.A{"$photos", s, l}}}}, {Key: "title", Value: 1}, {Key: "id", Value: 1}, {Key: "_id", Value: 0}}))
	err := doc.Decode(&result)
	return result, err
}

func GetCollectionsCount(photo_id string) (int, error) {
	collection := Client.Database(os.Getenv("DATABASE_NAME")).Collection("collection")
	ctx, cancel := context.WithTimeoutCause(context.TODO(), 3*time.Second, errors.New("operation timeout"))
	defer cancel()
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: bson.D{
			{Key: "$expr", Value: bson.D{
				{Key: "$gt", Value: bson.A{
					bson.D{{Key: "$size", Value: "$photos"}},
					0,
				}},
			}},
		}}},
	}
	if photo_id != "" {
		pipeline = append(pipeline, bson.D{{Key: "$match", Value: bson.D{{Key: "photos", Value: bson.D{{Key: "$elemMatch", Value: bson.D{{Key: "id", Value: photo_id}}}}}}}})
	}
	pipeline = append(pipeline, bson.D{{Key: "$count", Value: "count"}})
	val := make([]map[string]interface{}, 0)
	cur, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return 0, err
	}
	err = cur.All(ctx, &val)
	if err != nil {
		return 0, err
	}
	if len(val) > 0 {
		return int(val[0]["count"].(int32)), nil
	} else {
		return 0, nil
	}
}
