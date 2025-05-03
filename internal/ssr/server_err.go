package ssr

import (
	"net/http"
	"github.com/jelius-sama/go_reactive/internal/types"
)

const fallbackHTML string = `<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>500 - Pixelle</title>
</head>

<body>
  <h1>500 - Internal Server Error</h1>
</body>

</html>`

func RenderInternalServerError(w http.ResponseWriter, r *http.Request, metadataContext types.Head) {
	serverProps := types.SSRProps{
		DidEncounterInternalServerError: true,
		ServerSideProps: types.DataProps{
			PageData: types.PageData{
				Path:     r.URL.Path,
				Data:     nil,
				MetaData: metadataContext,
			},
		},
	}

	status := PerformSSR(w, r, http.StatusInternalServerError, serverProps)

	if status != 0 {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(fallbackHTML))
	}
}
