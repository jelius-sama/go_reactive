package ssr

import (
	"log"
	"net/http"
	"github.com/jelius-sama/go_reactive/internal/config"
	"github.com/jelius-sama/go_reactive/internal/types"
)

func RenderStaticPage(w http.ResponseWriter, r *http.Request) {
	// Get head metadata from config
	routes, err := config.GetStaticRoute(r.URL.Path)
	if err != nil {
		log.Printf("Error reading static route config: %v", err)
		RenderInternalServerError(w, r, types.Head{})
		return
	}

	// Merge all heads ({r.URL.Path} + "*") into a single Head
	merged := types.Head{}
	for _, h := range routes {
		if h.Title != "" {
			merged.Title = h.Title
		}
		merged.Meta = append(merged.Meta, h.Meta...)
		merged.Link = append(merged.Link, h.Link...)
		merged.Script = append(merged.Script, h.Script...)
	}

	serverProps := types.SSRProps{
		DidEncounterInternalServerError: false,
		ServerSideProps: types.DataProps{
			PageData: types.PageData{
				Path:     r.URL.Path,
				Data:     nil,
				MetaData: merged,
			},
		},
	}

	PerformSSR(w, r, http.StatusOK, serverProps)
}
