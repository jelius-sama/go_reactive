package ssr

import (
	"errors"
	"os"
	"path/filepath"
	"github.com/jelius-sama/go_reactive/internal/types"
)

const devHTMLShell string = `<!doctype html>
<html lang="en">

<head>
  <script type="module">import { injectIntoGlobalHook } from "http://localhost:5173/@react-refresh";
  injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;</script>
  <script type="module" src="http://localhost:5173/@vite/client"></script>
  <!-- SSR Props -->
</head>

<body>
  <div id="root"><!-- SSR Content here --></div>
  <script type="module" src="http://localhost:5173/src/main.tsx"></script>
</body>

</html>`

func GetHTML() ([]byte, error) {
	if os.Getenv("env") == types.ENV.Prod {
		content, err := os.ReadFile(filepath.Join(os.Getenv("ROOT_PATH"), "client/dist/index.html"))

		if err != nil {
			return []byte{}, errors.New("file not found")
		}

		return content, nil
	} else {
		return []byte(devHTMLShell), nil
	}
}
