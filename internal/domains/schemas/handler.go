package schemas

import (
	"encoding/json"
	"net/http"

	"github.com/euandresimoes/visualdb-go.git/internal/models"
	"github.com/go-chi/chi/v5"
)

type Handler struct {
	Service *Service
}

func NewHandler(service *Service) http.Handler {
	h := &Handler{Service: service}
	r := chi.NewRouter()

	r.Get("/", h.GetSchemas)

	return r
}

func (h *Handler) GetSchemas(w http.ResponseWriter, r *http.Request) {
	schemas, err := h.Service.GetSchemas()
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusConflict,
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(schemas)
}