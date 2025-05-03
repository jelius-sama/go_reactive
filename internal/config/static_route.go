package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"github.com/jelius-sama/go_reactive/internal/types"
)

var StaticRoute []types.StaticRoute

// Will send along an additional array with the path `*` which contains universal configs
func GetStaticRoute(path string) ([]types.Head, error) {
	if len(StaticRoute) <= 0 {
		conf, err := os.ReadFile(filepath.Join(os.Getenv("ROOT_PATH"), "shared", "static.route.json"))
		if err != nil {
			return nil, err
		}

		err = json.Unmarshal(conf, &StaticRoute)
		if err != nil {
			return nil, err
		}
	}
	var results []types.Head

	for _, route := range StaticRoute {
		if route.Path == path || route.Path == "*" {
			// Convert StaticRoute to Head, omitting Path
			results = append(results, types.Head{
				Title:  route.Title,
				Meta:   route.Meta,
				Script: route.Script,
				Link:   route.Link,
			})
		}
	}

	return results, nil
}
