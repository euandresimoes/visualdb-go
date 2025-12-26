package main

import (
	"log"
	"os"

	"github.com/euandresimoes/visualdb-go.git/internal/infra/database"
)

func main() {
	envs := map[string]string{
		"DB_TYPE":     os.Getenv("DB_TYPE"),
		"DB_USER":     os.Getenv("DB_USER"),
		"DB_PASSWORD": os.Getenv("DB_PASSWORD"),
		"DB_HOST":     os.Getenv("DB_HOST"),
		"DB_PORT":     os.Getenv("DB_PORT"),
		"DB_NAME":     os.Getenv("DB_NAME"),
		"SSL_MODE":    os.Getenv("SSL_MODE"),
	}

	for key, val := range envs {
		if val == "" {
			log.Fatalf("Missing env: %s", key)
		}
	}

	log.Printf("envs: %v\n", envs)

	pool, err := database.NewPool(database.DBConnConfig{
		Type:     envs["DB_TYPE"],
		User:     envs["DB_USER"],
		Password: envs["DB_PASSWORD"],
		Host:     envs["DB_HOST"],
		Port:     envs["DB_PORT"],
		Db:       envs["DB_NAME"],
		SSLMode:  envs["SSL_MODE"],
	})
	if err != nil {
		log.Fatalf("Error while creating connection pool %v\n", err)
	}

	api := &ApiConfig{
		Version: "v2.0",
		ApiPort: ":23806",
		DBPool:  pool,
		DBConfig: &DBConfig{
			DBHost: envs["DB_HOST"],
			DBPort: envs["DB_PORT"],
			DBType: envs["DB_TYPE"],
			DBName: envs["DB_NAME"],
			DBUser: envs["DB_USER"],
		},
	}

	api.Init()
}
