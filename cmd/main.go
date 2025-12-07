package main

import (
	"log"
	"os"

	"github.com/euandresimoes/visualdb-go.git/internal/infra/database"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error while loading envs %v\n", err)
	}

	envs := map[string]string{
		"DB_TYPE":     os.Getenv("DB_TYPE"),
		"DB_USER":     os.Getenv("DB_USER"),
		"DB_PASSWORD": os.Getenv("DB_PASSWORD"),
		"DB_HOST":     os.Getenv("DB_HOST"),
		"DB_PORT":     os.Getenv("DB_PORT"),
		"DB_NAME":     os.Getenv("DB_NAME"),
	}

	log.Printf("envs: %v\n", envs)

	pool, err := database.NewPool(database.DBConnConfig{
		Type:     envs["DB_TYPE"],
		User:     envs["DB_USER"],
		Password: envs["DB_PASSWORD"],
		Host:     envs["DB_HOST"],
		Port:     envs["DB_PORT"],
		Db:       envs["DB_NAME"],
	})
	if err != nil {
		log.Fatalf("Error while creating connection pool %v\n", err)
	}

	api := &ApiConfig{
		ApiPort: ":7020",
		DBPool:  pool,
		DBType:  envs["DB_TYPE"],
	}

	api.Init()
}
