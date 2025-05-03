package middleware

import "net/http"

// Middleware type for easier chaining
type Middleware func(http.Handler) http.Handler

// ChainMiddleware utility function
func ChainMiddleware(h http.Handler, middlewares ...Middleware) http.Handler {
	for i := len(middlewares) - 1; i >= 0; i-- {
		h = middlewares[i](h)
	}
	return h
}
