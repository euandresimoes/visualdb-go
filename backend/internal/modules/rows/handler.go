package rows

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

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

	r.Get("/export", h.ExportRowsToCSV)
	r.Get("/", h.GetRows)
	r.Post("/", h.InsertRow)
	r.Delete("/", h.DeleteRow)
	r.Patch("/", h.UpdateRow)

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

func (h *Handler) InsertRow(w http.ResponseWriter, r *http.Request) {
	var (
		schema = r.URL.Query().Get("schema")
		table  = r.URL.Query().Get("table")
	)

	if !httpx.Require(w, schema, "schema") {
		return
	}
	if !httpx.Require(w, table, "table") {
		return
	}

	var bodyData map[string]any
	if err := json.NewDecoder(r.Body).Decode(&bodyData); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	row, err := h.Service.InsertRow(schema, table, bodyData)
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusConflict,
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(row)
}

func (h *Handler) DeleteRow(w http.ResponseWriter, r *http.Request) {
	var (
		schema = r.URL.Query().Get("schema")
		table  = r.URL.Query().Get("table")
	)
	if !httpx.Require(w, schema, "schema") {
		return
	}
	if !httpx.Require(w, table, "table") {
		return
	}

	type Body struct {
		PKColumn string `json:"pk_column"`
		PKValue  any    `json:"pk_value"`
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

	row, err := h.Service.DeleteRow(schema, table, bodyData.PKColumn, bodyData.PKValue)
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusConflict,
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(row)
}

func (h *Handler) UpdateRow(w http.ResponseWriter, r *http.Request) {
	var (
		schema = r.URL.Query().Get("schema")
		table  = r.URL.Query().Get("table")
	)
	if !httpx.Require(w, schema, "schema") {
		return
	}
	if !httpx.Require(w, table, "table") {
		return
	}

	type Body struct {
		PKColumn string         `json:"pk_column"`
		PKValue  any            `json:"pk_value"`
		Data     map[string]any `json:"data"`
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

	row, err := h.Service.UpdateRow(schema, table, bodyData.PKColumn, bodyData.PKValue, bodyData.Data)
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusConflict,
			Message: err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(row)
}

func (h *Handler) ExportRowsToCSV(w http.ResponseWriter, r *http.Request) {
	var (
		schema = r.URL.Query().Get("schema")
		table  = r.URL.Query().Get("table")
	)
	if !httpx.Require(w, schema, "schema") {
		return
	}
	if !httpx.Require(w, table, "table") {
		return
	}

	now := time.Now()
	ms := now.Nanosecond() / 1_000_000

	date := fmt.Sprintf(
		"export_%04d-%02d-%02dT%02d-%02d-%02d-%03d.csv",
		now.Year(),
		now.Month(),
		now.Day(),
		now.Hour(),
		now.Minute(),
		now.Second(),
		ms,
	)

	ctx := r.Context()

	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set(
		"Content-Disposition",
		fmt.Sprintf(`attachment; filename="%s"`, date),
	)

	err := h.Service.ExportRowsToCSV(ctx, schema, table, w)
	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(models.ApiResponse{
			Status:  http.StatusConflict,
			Message: err.Error(),
		})
		return
	}
}
