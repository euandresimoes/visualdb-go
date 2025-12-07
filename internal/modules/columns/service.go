package columns

import "github.com/euandresimoes/visualdb-go.git/internal/models"

type Service struct {
	Repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{Repository: repository}
}

func (s *Service) GetColumns(schema string, table string) (*models.ApiResponse, error) {
	return s.Repository.GetColumns(schema, table)
}
