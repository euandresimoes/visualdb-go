package columns

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

	r.Get("/", h.GetColumns)

	return r
}

func (h *Handler) GetColumns(w http.ResponseWriter, r *http.Request) {
	schema := r.URL.Query().Get("schema")
	table := r.URL.Query().Get("table")

	if schema == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusBadRequest,
			Message: "schema is required",
		})
		return
	}

	if table == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusBadRequest,
			Message: "table is required",
		})
		return
	}

	columns, err := h.Service.GetColumns(schema, table)
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusConflict,
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(columns)
}
