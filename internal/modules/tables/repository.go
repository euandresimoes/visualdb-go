package tables

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

func (r *Repository) GetTables(schema string) (*models.ApiResponse, error) {
	switch r.DBType {
	case "postgres":
		return postgres.GetTables(r.DB, schema)
	default:
		return nil, errors.New("unsupported database type")
	}
}
