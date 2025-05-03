package ssr

import (
	"net/http"
	"github.com/jelius-sama/go_reactive/internal/types"
)

func RenderNotFound(w http.ResponseWriter, r *http.Request) {
	head := types.Head{
		Title: "404",
		Meta: []types.Meta{
			{Charset: "UTF-8"},
			{Name: "robots", Content: "noindex"},
			{Name: "viewport", Content: "width=device-width, initial-scale=1.0"},
			{Name: "description", Content: "Sorry, the page you are looking for doesn’t exist. Try exploring more artwork on Pixelle."},
			{Property: "og:title", Content: "404 – Page Not Found"},
			{Property: "og:description", Content: "This page does not exist. Go back to the homepage or browse featured artwork."},
			{Property: "og:type", Content: "website"},
			{Name: "twitter:card", Content: "summary_large_image"},
			{Name: "twitter:title", Content: "404 – Page Not Found"},
			{Name: "twitter:description", Content: "This page does not exist. Go back to the homepage or browse featured artwork."},
		},
		Link: []types.Link{
			{Rel: "icon", Href: "/assets/favicon.ico"},
		},
	}

	serverProps := types.SSRProps{
		DidEncounterInternalServerError: false,
		ServerSideProps: types.DataProps{
			PageData: types.PageData{
				Path:     r.URL.Path,
				Data:     nil,
				MetaData: head,
			},
		},
	}

	PerformSSR(w, r, http.StatusNotFound, serverProps)
}
