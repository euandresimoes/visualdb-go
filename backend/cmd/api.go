package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/euandresimoes/visualdb-go.git/internal/infra/middlewares"
	"github.com/euandresimoes/visualdb-go.git/internal/modules/columns"
	"github.com/euandresimoes/visualdb-go.git/internal/modules/query"
	"github.com/euandresimoes/visualdb-go.git/internal/modules/rows"
	"github.com/euandresimoes/visualdb-go.git/internal/modules/schemas"
	"github.com/euandresimoes/visualdb-go.git/internal/modules/tables"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
)

func (api *ApiConfig) Init() {
	r := chi.NewRouter()

	// Basic CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// A good base middleware stack
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Set a timeout value on the request context (ctx), that will signal
	// through ctx.Done() that the request has timed out and further
	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))

	// My Middlewares
	r.Use(middlewares.ContentType)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"status":  http.StatusOK,
			"message": "pong",
		})
	})

	// Schemas Routes
	schemasRepository := schemas.NewRepository(api.DBPool, api.DBType)
	schemasService := schemas.NewService(schemasRepository)
	schemasHandler := schemas.NewHandler(schemasService)
	r.Mount("/schemas", schemasHandler)

	// Tables Routes
	tablesRepository := tables.NewRepository(api.DBPool, api.DBType)
	tablesService := tables.NewService(tablesRepository)
	tablesHandler := tables.NewHandler(tablesService)
	r.Mount("/tables", tablesHandler)

	// Columns Routes
	columnsRepository := columns.NewRepository(api.DBPool, api.DBType)
	columnsService := columns.NewService(columnsRepository)
	columnsHandler := columns.NewHandler(columnsService)
	r.Mount("/columns", columnsHandler)

	// Rows Routes
	rowsRepository := rows.NewRepository(api.DBPool, api.DBType)
	rowsService := rows.NewService(rowsRepository)
	rowsHandler := rows.NewHandler(rowsService)
	r.Mount("/rows", rowsHandler)

	// Query Routes
	queryRepository := query.NewRepository(api.DBPool, api.DBType)
	queryService := query.NewService(queryRepository)
	queryHandler := query.NewHandler(queryService)
	r.Mount("/query", queryHandler)

	log.Printf("Listening on port %s\n", api.ApiPort)
	http.ListenAndServe(api.ApiPort, r)
}

type ApiConfig struct {
	ApiPort string
	DBPool  *pgxpool.Pool
	DBType  string
}
