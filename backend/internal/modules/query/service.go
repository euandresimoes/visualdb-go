package query

import "github.com/euandresimoes/visualdb-go.git/internal/models"

type Service struct {
	Repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{Repository: repository}
}

func (s *Service) RunQuery(query string) (*models.ApiResponse, error) {
	return s.Repository.RunQuery(query)
}
