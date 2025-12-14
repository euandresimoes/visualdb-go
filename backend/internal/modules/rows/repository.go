package rows

import (
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"io"

	"github.com/euandresimoes/visualdb-go.git/internal/drivers/postgres"
	"github.com/euandresimoes/visualdb-go.git/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB     *pgxpool.Pool
	DBType string
}

func NewRepository(db *pgxpool.Pool, dbType string) *Repository {
	return &Repository{DB: db, DBType: dbType}
}

func (r *Repository) GetRows(schema string, table string, page int, limit int) (*models.ApiResponse, error) {
	switch r.DBType {
	case "postgres":
		return postgres.GetRows(r.DB, schema, table, page, limit)
	default:
		return nil, errors.New("unsupported database type")
	}
}

func (r *Repository) InsertRow(schema string, table string, row map[string]any) (*models.ApiResponse, error) {
	switch r.DBType {
	case "postgres":
		return postgres.InsertRow(r.DB, schema, table, row)
	default:
		return nil, errors.New("unsupported database type")
	}
}

func (r *Repository) DeleteRow(schema string, table string, pkColumn string, pkValue any) (*models.ApiResponse, error) {
	switch r.DBType {
	case "postgres":
		return postgres.DeleteRow(r.DB, schema, table, pkColumn, pkValue)
	default:
		return nil, errors.New("unsupported database type")
	}
}

func (r *Repository) UpdateRow(schema string, table string, pkColumn string, pkValue any, row map[string]any) (*models.ApiResponse, error) {
	switch r.DBType {
	case "postgres":
		return postgres.UpdateRow(r.DB, schema, table, pkColumn, pkValue, row)
	default:
		return nil, errors.New("unsupported database type")
	}
}

func (r *Repository) ExportRowsToCSV(ctx context.Context, schema string, table string, w io.Writer) error {
	query := fmt.Sprintf(`
		SELECT * FROM "%s"."%s"
	`, schema, table)

	rows, err := r.DB.Query(
		ctx,
		query,
	)
	if err != nil {
		return err
	}
	defer rows.Close()

	csvWriter := csv.NewWriter(w)
	defer csvWriter.Flush()

	fieldDescriptions := rows.FieldDescriptions()
	headers := make([]string, len(fieldDescriptions))
	for i, fd := range fieldDescriptions {
		headers[i] = string(fd.Name)
	}

	if err := csvWriter.Write(headers); err != nil {
		return err
	}

	values := make([]any, len(headers))
	valuesPtrs := make([]any, len(headers))

	for i := range values {
		valuesPtrs[i] = &values[i]
	}

	for rows.Next() {
		if err := rows.Scan(valuesPtrs...); err != nil {
			return err
		}

		record := make([]string, len(values))
		for i, v := range values {
			if v == nil {
				record[i] = ""
			} else {
				record[i] = fmt.Sprint(v)
			}
		}

		if err := csvWriter.Write(record); err != nil {
			return err
		}
	}

	return rows.Err()
}
