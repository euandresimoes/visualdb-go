package schemas

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

func (r *Repository) GetSchemas() (*models.ApiResponse, error) {
	switch r.DBType {
	case "postgres":
		return postgres.GetSchemas(r.DB)
	default:
		return nil, errors.New("unsupported database type")
	}
}