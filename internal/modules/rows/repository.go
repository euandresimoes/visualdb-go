package rows

import (
	"errors"

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

func (r *Repository) DeleteRow(schema string, table string, id int) (*models.ApiResponse, error) {
	switch r.DBType {
	case "postgres":
		return postgres.DeleteRow(r.DB, schema, table, id)
	default:
		return nil, errors.New("unsupported database type")
	}
}
