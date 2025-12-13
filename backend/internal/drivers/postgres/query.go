package postgres

import (
	"context"
	"net/http"

	"github.com/euandresimoes/visualdb-go.git/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

func RunQuery(db *pgxpool.Pool, query string) (*models.ApiResponse, error) {
	_, err := db.Exec(
		context.Background(),
		query,
	)
	if err != nil {
		return nil, err
	}

	return &models.ApiResponse{
		Status:  http.StatusOK,
		Message: "success",
		Data:    query,
	}, nil
}
