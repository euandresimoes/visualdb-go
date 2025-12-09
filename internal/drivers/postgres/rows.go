package postgres

import (
	"context"
	"fmt"
	"net/http"

	"github.com/euandresimoes/visualdb-go.git/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

func GetRows(db *pgxpool.Pool, schema string, table string, page int, limit int) (*models.ApiResponse, error) {
	rowsList := make([]map[string]any, 0, limit)

	offsetValue := (page - 1) * limit
	query := fmt.Sprintf(`SELECT * FROM "%s"."%s" LIMIT %d OFFSET %d`, schema, table, limit, offsetValue)

	rows, err := db.Query(context.Background(), query)
	cols := rows.FieldDescriptions()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		values, _ := rows.Values()
		rowMap := map[string]any{}

		for i, col := range cols {
			rowMap[col.Name] = values[i]
		}

		rowsList = append(rowsList, rowMap)
	}

	return &models.ApiResponse{
		Status:  http.StatusOK,
		Message: "success",
		Data:    rowsList,
	}, nil
}
