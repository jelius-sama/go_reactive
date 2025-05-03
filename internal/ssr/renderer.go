package ssr

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/jelius-sama/go_reactive/internal/types"
	"io"
	"log"
	"net"
	"net/http"
)

func PerformSSR(w http.ResponseWriter, r *http.Request, statusCode int, ssrProps types.SSRProps) int {
	if ssrProps.DidEncounterInternalServerError {
		log.Println("Encountered Internal Server Error returning early to avoid infinite loop.")
		return 1
	}

	htmlShell, err := GetHTML()
	if err != nil {
		RenderInternalServerError(w, r, ssrProps.ServerSideProps.PageData.MetaData)
		log.Println("SSR error (HTML shell):", err)
		return 1
	}

	var userAssets *types.UserAssets

	serverProps := types.SSRProps{
		DidEncounterInternalServerError: ssrProps.DidEncounterInternalServerError,
		ServerSideProps: types.DataProps{
			UserAssets: userAssets,
			UserData:   nil,
			PageData: types.PageData{
				Path:     ssrProps.ServerSideProps.PageData.Path,
				Data:     ssrProps.ServerSideProps.PageData.Data,
				MetaData: ssrProps.ServerSideProps.PageData.MetaData,
			},
		},
	}

	propsJSON, err := json.Marshal(serverProps)
	if err != nil {
		RenderInternalServerError(w, r, ssrProps.ServerSideProps.PageData.MetaData)
		log.Println("SSR error (props marshal):", err)
		return 1
	}
	propsScript := fmt.Sprintf(`<script>window.__SERVER_PROPS__ = %s;</script>`, propsJSON)

	meta := serverProps.ServerSideProps.PageData.MetaData
	var metaTags bytes.Buffer

	// Title
	if meta.Title != "" {
		metaTags.WriteString(fmt.Sprintf("<title>%s</title>\n", meta.Title))
	}

	// Meta
	for _, m := range meta.Meta {
		tag := `<meta`
		if m.Charset != "" {
			tag += fmt.Sprintf(` charset="%s"`, m.Charset)
		}
		if m.Name != "" {
			tag += fmt.Sprintf(` name="%s"`, m.Name)
		}
		if m.Content != "" {
			tag += fmt.Sprintf(` content="%s"`, m.Content)
		}
		if m.Property != "" {
			tag += fmt.Sprintf(` property="%s"`, m.Property)
		}
		if m.HttpEquiv != "" {
			tag += fmt.Sprintf(` http-equiv="%s"`, m.HttpEquiv)
		}
		tag += ">\n"
		metaTags.WriteString(tag)
	}

	// Link
	for _, l := range meta.Link {
		tag := fmt.Sprintf(`<link rel="%s" href="%s"`, l.Rel, l.Href)
		if l.Crossorigin != "" {
			tag += fmt.Sprintf(` crossorigin="%s"`, l.Crossorigin)
		}
		if l.Type != "" {
			tag += fmt.Sprintf(` type="%s"`, l.Type)
		}
		tag += ">\n"
		metaTags.WriteString(tag)
	}

	// Script
	for _, s := range meta.Script {
		tag := `<script`
		if s.Type != "" {
			tag += fmt.Sprintf(` type="%s"`, s.Type)
		}
		if s.SRC != "" {
			tag += fmt.Sprintf(` src="%s"`, s.SRC)
		}
		if s.Defer {
			tag += ` defer`
		}
		tag += `>`
		tag += s.Content
		tag += `</script>` + "\n"
		metaTags.WriteString(tag)
	}

	// Append meta + script into <!-- SSR Props --> marker
	const propsMarker = "<!-- SSR Props -->"
	propsIndex := bytes.Index(htmlShell, []byte(propsMarker))
	if propsIndex == -1 {
		RenderInternalServerError(w, r, ssrProps.ServerSideProps.PageData.MetaData)
		log.Println("SSR error: props marker not found")
		return 1
	}

	var htmlWithProps bytes.Buffer
	htmlWithProps.Grow(len(htmlShell) - len(propsMarker) + len(metaTags.Bytes()) + len(propsScript))
	htmlWithProps.Write(htmlShell[:propsIndex])
	htmlWithProps.Write(metaTags.Bytes())
	htmlWithProps.WriteString(propsScript)
	htmlWithProps.Write(htmlShell[propsIndex+len(propsMarker):])

	// Connect to Bun via Unix domain socket
	conn, err := net.Dial("unix", "/tmp/ssr.sock")
	if err != nil {
		RenderInternalServerError(w, r, ssrProps.ServerSideProps.PageData.MetaData)
		log.Println("SSR error (socket connect):", err)
		return 1
	}
	defer conn.Close()

	// Send props to Bun
	_, err = conn.Write(propsJSON)
	if err != nil {
		RenderInternalServerError(w, r, ssrProps.ServerSideProps.PageData.MetaData)
		log.Println("SSR error (socket write):", err)
		return 1
	}

	// Inject streamed HTML into <!-- SSR Content here -->
	const contentMarker = "<!-- SSR Content here -->"
	contentIndex := bytes.Index(htmlWithProps.Bytes(), []byte(contentMarker))
	if contentIndex == -1 {
		RenderInternalServerError(w, r, ssrProps.ServerSideProps.PageData.MetaData)
		log.Println("SSR error: content marker not found")
		return 1
	}

	var finalHTML bytes.Buffer
	finalHTML.Grow(len(htmlWithProps.Bytes()))
	finalHTML.Write(htmlWithProps.Bytes()[:contentIndex])
	_, err = io.Copy(&finalHTML, conn)
	if err != nil {
		RenderInternalServerError(w, r, ssrProps.ServerSideProps.PageData.MetaData)
		log.Println("SSR error (socket read):", err)
		return 1
	}
	finalHTML.Write(htmlWithProps.Bytes()[contentIndex+len(contentMarker):])

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(statusCode)
	w.Write(finalHTML.Bytes())
	return 0
}
