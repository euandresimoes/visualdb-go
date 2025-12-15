package database

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DBConnConfig struct {
	Type     string
	User     string
	Password string
	Host     string
	Port     string
	Db       string
	SSLMode  string
}

func NewPool(data DBConnConfig) (*pgxpool.Pool, error) {
	if data.SSLMode == "" {
		data.SSLMode = "disable"
	}

	pool, err := pgxpool.New(
		context.Background(),
		fmt.Sprintf(
			"%s://%s:%s@%s:%s/%s?sslmode=%s",
			data.Type,
			data.User,
			data.Password,
			data.Host,
			data.Port,
			data.Db,
			data.SSLMode,
		),
	)
	if err != nil {
		return nil, err
	}

	return pool, nil
}
