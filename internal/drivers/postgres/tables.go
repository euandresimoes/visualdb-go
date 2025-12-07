package postgres

import (
	"context"
	"net/http"

	"github.com/euandresimoes/visualdb-go.git/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

func GetTables(db *pgxpool.Pool, schema string) (*models.ApiResponse, error) {
	query := `
		SELECT table_name
		FROM information_schema.tables
		WHERE table_schema = $1
		ORDER BY table_name
	`

	rows, err := db.Query(
		context.Background(),
		query,
		schema,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			return nil, err
		}
		tables = append(tables, tableName)
	}

	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return &models.ApiResponse{
		Status:  http.StatusOK,
		Message: "success",
		Data:    tables,
	}, nil
}
