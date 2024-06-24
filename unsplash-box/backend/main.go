package main

import (
	"log"
	"os"

	"github.com/debadutta98/unsplash-box/backend/db"
	"github.com/debadutta98/unsplash-box/backend/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	cors "github.com/rs/cors/wrapper/gin"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println(err)
	}
	db.Connect()
	PORT := os.Getenv("PORT")
	app := gin.Default()

	app.Use(cors.AllowAll())

	routes.Registerv1Router(app)

	if e := app.Run(":" + PORT); e != nil {
		log.Fatal(err)
	} else {
		log.Printf("Server is running on PORT %s\n", PORT)
	}
}
