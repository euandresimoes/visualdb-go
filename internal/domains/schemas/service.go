package schemas

import "github.com/euandresimoes/visualdb-go.git/internal/models"

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) GetSchemas() (*models.ApiResponse, error) {
	return s.repository.GetSchemas()
}