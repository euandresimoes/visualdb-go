package postgres

import (
	"context"
	"fmt"
	"net/http"
	"strings"

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

func InsertRow(db *pgxpool.Pool, schema string, table string, row map[string]any) (*models.ApiResponse, error) {
	columns := make([]string, 0, len(row))
	values := make([]any, 0, len(row))
	placeholders := make([]string, 0, len(row))

	i := 1
	for col, val := range row {
		columns = append(columns, fmt.Sprintf(`"%s"`, col))
		values = append(values, val)
		placeholders = append(placeholders, fmt.Sprintf("$%d", i))
		i++
	}

	query := fmt.Sprintf(`
		INSERT INTO "%s"."%s" (%s)
		VALUES (%s)
	`, schema, table, strings.Join(columns, ","), strings.Join(placeholders, ","))

	_, err := db.Exec(context.Background(), query, values...)
	if err != nil {
		return nil, err
	}

	return &models.ApiResponse{
		Status:  http.StatusOK,
		Message: "success",
		Data:    row,
	}, nil
}

func DeleteRow(db *pgxpool.Pool, schema string, table string, pkColumn string, pkValue any) (*models.ApiResponse, error) {
	query := fmt.Sprintf(`DELETE FROM "%s"."%s" WHERE "%s" = $1`, schema, table, pkColumn)

	_, err := db.Exec(context.Background(), query, pkValue)
	if err != nil {
		return nil, err
	}

	return &models.ApiResponse{
		Status:  http.StatusOK,
		Message: "success",
	}, nil
}

func UpdateRow(db *pgxpool.Pool, schema string, table string, pkColumn string, pkValue any, row map[string]any) (*models.ApiResponse, error) {
	colsAndVals := make([]string, 0, len(row))

	for col, val := range row {
		switch val.(type) {
		case string:
			colsAndVals = append(colsAndVals, fmt.Sprintf(`%s = '%s'`, col, val))
		default:
			colsAndVals = append(colsAndVals, fmt.Sprintf(`%s = %v`, col, val))
		}
	}

	query := fmt.Sprintf(`
		UPDATE "%s"."%s"
		SET %s
		WHERE %s = %v
	`, schema, table, strings.Join(colsAndVals, ","), pkColumn, pkValue)

	_, err := db.Exec(context.Background(), query)
	if err != nil {
		return nil, err
	}

	return &models.ApiResponse{
		Status:  http.StatusOK,
		Message: "success",
		Data:    row,
	}, nil
}
