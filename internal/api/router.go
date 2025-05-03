package api

import (
	"net/http"
	"strings"
)

var apiRoutes = map[string]http.HandlerFunc{
	"GET /quote": GetQuotesHandler,
}

func ApiRouter(w http.ResponseWriter, r *http.Request) {
	if !strings.HasPrefix(r.URL.Path, "/api/") {
		NotFound(w, r)
		return
	}

	method := r.Method
	path := strings.TrimPrefix(r.URL.Path, "/api/")
	lookupKey := method + " /" + path

	if handler, exists := apiRoutes[lookupKey]; exists {
		handler(w, r)
		return
	}

	NotFound(w, r)
}

// NetworkRequestType is used to identify that this is an HTTP request
type NetworkRequestType struct{}

// DirectRequestType is used to identify that this is a direct function call
type DirectRequestType struct{}
