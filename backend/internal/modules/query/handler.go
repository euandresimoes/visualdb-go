package query

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

	r.Post("/", h.RunQuery)

	return r
}

func (h *Handler) RunQuery(w http.ResponseWriter, r *http.Request) {
	type Body struct {
		Query string `json:"query"`
	}

	var bodyData Body
	if err := json.NewDecoder(r.Body).Decode(&bodyData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	res, err := h.Service.RunQuery(bodyData.Query)
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusConflict,
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}
