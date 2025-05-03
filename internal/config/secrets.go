package config

import (
	"bufio"
	"log"
	"os"
	"path/filepath"
	"strings"
)

func InitSecrets() {
	file, err := os.Open(filepath.Join(os.Getenv("ROOT_PATH"), ".env"))

	if err != nil {
		log.Fatalf("Error loading .env file: %v\n", err)
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()

		// Ignore comments and empty lines
		if strings.HasPrefix(line, "#") || strings.TrimSpace(line) == "" {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])
		value = strings.Trim(value, `"'`) // Remove surrounding quotes if present

		if err := os.Setenv(key, value); err != nil {
			log.Fatalf("Error setting env variable %s: %v\n", key, err)
		}
	}

	if err := scanner.Err(); err != nil {
		log.Fatalf("Error reading .env file: %v\n", err)
	}
}
