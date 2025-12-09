package rows

import "github.com/euandresimoes/visualdb-go.git/internal/models"

type Service struct {
	Repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{Repository: repository}
}

func (s *Service) GetRows(schema string, table string, page int, limit int) (*models.ApiResponse, error) {
	return s.Repository.GetRows(schema, table, page, limit)
}

func (s *Service) InsertRow(schema string, table string, row map[string]any) (*models.ApiResponse, error) {
	return s.Repository.InsertRow(schema, table, row)
}

func (s *Service) DeleteRow(schema string, table string, id int) (*models.ApiResponse, error) {
	return s.Repository.DeleteRow(schema, table, id)
}
