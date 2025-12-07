package models

type ApiResponse struct {
	Status  any    `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}
