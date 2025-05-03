package api

import (
	"encoding/json"
	"net/http"
	"strconv"
)

// Quote represents a quote with a unique index.
type Quote struct {
	ID    int    `json:"id"`
	Value string `json:"quote"`
}

var quotes = []Quote{
	{ID: 0, Value: "Simplicity is the soul of efficiency."},
	{ID: 1, Value: "Code never lies, comments sometimes do."},
	{ID: 2, Value: "Make it work, make it right, make it fast."},
}

// QuoteRequestMetadata can be extended later, but kept minimal here
type QuoteRequestMetadata struct {
	Limit  int
	Offset int
}

// GetQuotesHandler handles HTTP requests
func GetQuotesHandler(w http.ResponseWriter, r *http.Request) {
	metadata := QuoteRequestMetadata{
		Limit:  len(quotes),
		Offset: 0,
	}

	if l, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil {
		metadata.Limit = l
	}
	if o, err := strconv.Atoi(r.URL.Query().Get("offset")); err == nil {
		metadata.Offset = o
	}

	resp := GetQuotesInternal[*http.ResponseWriter](metadata, &w)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

// GetQuotesInternal can be called via HTTP or directly from server code
func GetQuotesInternal[T any](metadata QuoteRequestMetadata, _ any) []Quote {
	total := len(quotes)

	start := metadata.Offset
	end := start + metadata.Limit
	if start > total {
		start = total
	}
	if end > total {
		end = total
	}

	return quotes
}

// GetQuotesDirect allows internal usage
func GetQuotesDirect(metadata QuoteRequestMetadata) []Quote {
	return GetQuotesInternal[DirectRequestType](metadata, nil)
}
