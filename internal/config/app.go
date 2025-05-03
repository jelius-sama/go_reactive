package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"github.com/jelius-sama/go_reactive/internal/types"
	"sync"
)

var (
	AppConfig types.AppConfig
	loadOnce  sync.Once
	loadErr   error
)

func GetAppConfig() (types.AppConfig, error) {
	loadOnce.Do(func() {
		conf, err := os.ReadFile(filepath.Join(os.Getenv("ROOT_PATH"), "shared", "app.config.json"))
		if err != nil {
			loadErr = err
			return
		}

		err = json.Unmarshal(conf, &AppConfig)
		if err != nil {
			loadErr = err
		}
	})

	return AppConfig, loadErr
}
