package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"github.com/jelius-sama/go_reactive/internal/api"
	"github.com/jelius-sama/go_reactive/internal/config"
	"github.com/jelius-sama/go_reactive/internal/middleware"
	"github.com/jelius-sama/go_reactive/internal/ssr"
	"github.com/jelius-sama/go_reactive/internal/types"
)

var Port = "5000"
var Environment = "development"
var Version string

func InitEnvironment() {
	exePath, err := os.Executable()
	if err != nil {
		log.Fatalln("Error getting executable path:", err)
	}

	os.Setenv("ROOT_PATH", filepath.Dir(filepath.Dir(exePath)))
	os.Setenv("version", Version)
	os.Setenv("env", Environment)
	os.Setenv("port", Port)
}

func init() {
	InitEnvironment()
	config.InitSecrets()
}

func main() {
	router := http.NewServeMux()

	if os.Getenv("env") == types.ENV.Prod {
		router.HandleFunc("/src/", func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodGet {
				http.Error(w, "403 - Forbidden", http.StatusForbidden)
				return
			}

			filePath := filepath.Join(os.Getenv("ROOT_PATH"), "client/dist"+r.URL.Path)
			http.ServeFile(w, r, filePath)
		})
	}

	router.HandleFunc("/", ssr.PageRouter)

	router.HandleFunc("/assets/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			api.Forbidden(w, r)
			return
		}

		filePath := filepath.Join(os.Getenv("ROOT_PATH"), r.URL.Path)
		http.ServeFile(w, r, filePath)
	})

	router.Handle("/api/", middleware.LoggingMiddleware(http.HandlerFunc(api.ApiRouter)))

	startServer := func(addr string, handler http.Handler) error {
		fmt.Printf("Starting server on port %s...\n", addr)
		return http.ListenAndServe(addr, middleware.ChainMiddleware(handler,
			middleware.RecoveryMiddleware,
			middleware.NoCacheMiddleware,
		))
	}

	if err := startServer(":"+Port, router); err != nil {
		panic(fmt.Sprintf("Could not start the server: %s", err))
	}
}
