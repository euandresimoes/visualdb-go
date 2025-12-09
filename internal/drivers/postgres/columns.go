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
			c.column_name,
			c.data_type,
			c.is_nullable,
			c.column_default,
			CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN true ELSE false END AS is_primary_key
		FROM information_schema.columns c
		LEFT JOIN information_schema.key_column_usage kcu
			ON c.table_name = kcu.table_name
			AND c.column_name = kcu.column_name
			AND c.table_schema = kcu.table_schema
		LEFT JOIN information_schema.table_constraints tc
			ON tc.constraint_name = kcu.constraint_name
			AND tc.table_schema = kcu.table_schema
			AND tc.table_name = kcu.table_name
			AND tc.constraint_type = 'PRIMARY KEY'
		WHERE c.table_schema = $1
		AND c.table_name = $2
		ORDER BY c.ordinal_position;
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
		var isPrimaryKey bool
		if err := rows.Scan(&columnName, &dataType, &isNullable, &columnDefault, &isPrimaryKey); err != nil {
			return nil, err
		}

		columnsList = append(columnsList, models.ColumnModel{
			Name:          columnName,
			DataType:      dataType,
			IsNullable:    isNullable,
			ColumnDefault: columnDefault,
			IsPrimaryKey:  isPrimaryKey,
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
