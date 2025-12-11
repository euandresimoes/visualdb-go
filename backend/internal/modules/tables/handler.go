package tables

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

	r.Get("/", h.GetTables)

	return r
}

func (h *Handler) GetTables(w http.ResponseWriter, r *http.Request) {
	schema := r.URL.Query().Get("schema")
	if schema == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusBadRequest,
			Message: "schema is required",
		})
		return
	}

	tables, err := h.Service.GetTables(schema)
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusConflict,
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(tables)
}
