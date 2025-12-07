package postgres

import (
	"context"
	"net/http"

	"github.com/euandresimoes/visualdb-go.git/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

func GetSchemas(db *pgxpool.Pool) (*models.ApiResponse, error) {
	var schemasList []string

	query := `
		SELECT schema_name
		FROM information_schema.schemata
		ORDER BY schema_name
	`

	rows, err := db.Query(
		context.Background(),
		query,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var schemaName string
		if err := rows.Scan(&schemaName); err != nil {
			return nil, err
		}
		schemasList = append(schemasList, schemaName)
	}

	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return &models.ApiResponse{
		Status:  http.StatusOK,
		Message: "success",
		Data:    schemasList,
	}, nil
}
