package rows

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/euandresimoes/visualdb-go.git/internal/infra/httpx"
	"github.com/euandresimoes/visualdb-go.git/internal/models"
	"github.com/go-chi/chi/v5"
)

type Handler struct {
	Service *Service
}

func NewHandler(service *Service) http.Handler {
	h := &Handler{Service: service}
	r := chi.NewRouter()

	r.Get("/", h.GetRows)

	return r
}

func (h *Handler) GetRows(w http.ResponseWriter, r *http.Request) {
	var (
		schema   = r.URL.Query().Get("schema")
		table    = r.URL.Query().Get("table")
		page, _  = strconv.Atoi(r.URL.Query().Get("page"))
		limit, _ = strconv.Atoi(r.URL.Query().Get("limit"))
	)

	if !httpx.Require(w, schema, "schema") {
		return
	}
	if !httpx.Require(w, table, "table") {
		return
	}
	if !httpx.Require(w, page, "page") {
		return
	}
	if !httpx.Require(w, limit, "limit") {
		return
	}

	rows, err := h.Service.GetRows(schema, table, page, limit)
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusConflict,
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(rows)
}
