package ssr

import (
	"net/http"
	"regexp"
	"strings"
)

type route struct {
	pattern *regexp.Regexp
	handler http.HandlerFunc
}

var pageRoutes = []route{
	{regexp.MustCompile(`^/$`), RenderHome},
	{regexp.MustCompile(`^/sign-in$`), RenderStaticPage},
	{regexp.MustCompile(`^/sign-up$`), RenderStaticPage},
}

func PageRouter(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimSuffix(r.URL.Path, "/")
	if path == "" {
		path = "/"
	}

	normalized := normalizePath(path)

	if normalized != path {
		http.Redirect(w, r, normalized, http.StatusFound)
		return
	}

	for _, route := range pageRoutes {
		if route.pattern.MatchString(path) {
			route.handler(w, r)
			return
		}
	}

	RenderNotFound(w, r)
}

var protectedRoutes = map[string]string{}

var guestOnlyRoutes = map[string]string{
	"/sign-in": "/",
	"/sign-up": "/",
}

func normalizePath(path string) string {
	// This thing does not allow SSR rendering on certain pages and redirect to another page on the basis of user login status
	// This behavior is not applied to client side (probably).

	if redirectPath, ok := guestOnlyRoutes[path]; ok {
		return redirectPath
	}
	return path
}
