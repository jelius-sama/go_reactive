package api

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func writeJSON(w http.ResponseWriter, status int, data ErrorResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func NotFound(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusNotFound, ErrorResponse{
		Error: "404 - Not Found",
	})
}

func Forbidden(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusForbidden, ErrorResponse{
		Error: "403 - Forbidden",
	})
}

func MethodNotAllowed(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusMethodNotAllowed, ErrorResponse{
		Error: "405 - Method Not Allowed",
	})
}
