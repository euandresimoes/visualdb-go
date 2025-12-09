package postgres

import (
	"context"
	"net/http"

	"github.com/euandresimoes/visualdb-go.git/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

func GetColumns(db *pgxpool.Pool, schema string, table string) (*models.ApiResponse, error) {
	query := `
		SELECT
			column_name,
			data_type,
			is_nullable,
			column_default
		FROM information_schema.columns
		WHERE table_schema = $1
		AND table_name = $2
		ORDER BY ordinal_position
	`

	rows, err := db.Query(
		context.Background(),
		query,
		schema, table,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	columnsList := []models.ColumnModel{}
	for rows.Next() {
		var columnName string
		var dataType string
		var isNullable *string
		var columnDefault *string
		if err := rows.Scan(&columnName, &dataType, &isNullable, &columnDefault); err != nil {
			return nil, err
		}

		columnsList = append(columnsList, models.ColumnModel{
			Name:          columnName,
			DataType:      dataType,
			IsNullable:    isNullable,
			ColumnDefault: columnDefault,
		})
	}

	if len(columnsList) == 0 {
		return &models.ApiResponse{Status: http.StatusNoContent, Message: "no columns found"}, nil
	}

	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return &models.ApiResponse{Status: http.StatusOK, Message: "success", Data: columnsList}, nil
}
