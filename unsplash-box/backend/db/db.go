package db

import (
	"context"
	"errors"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client = nil

func Connect() {
	var err error
	mongoOptions := options.Client().ApplyURI(os.Getenv("MONGO_URL"))
	ctx, cancel := context.WithTimeoutCause(context.Background(), 2*time.Second, errors.New("connection timeout"))
	defer cancel()
	Client, err = mongo.Connect(ctx, mongoOptions)
	if err != nil {
		log.Fatalln("Error during connect mongodb", err)
	}
	log.Println("Connect mongo Db")
}

func Disconnect() {
	ctx, cancel := context.WithTimeoutCause(context.Background(), 2*time.Second, errors.New("connection timeout"))
	defer cancel()
	err := Client.Disconnect(ctx)
	if err != nil {
		log.Fatalln("Unable to disconnect mongo", err)
	}
	log.Println("Disconnect mongodb")
}
