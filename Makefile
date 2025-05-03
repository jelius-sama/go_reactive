VERSION := $(shell jq -r '.version' ./shared/app.config.json)
APP_NAME := $(shell jq -r '.title' ./shared/app.config.json)
PORT := $(shell jq -r '.port' ./shared/app.config.json)

OUTPUT_DIR ?= ./build
TAR_FILE ?= $(APP_NAME)-$(VERSION).tar.gz
BIN_DIR ?= ./bin

.PHONY: compile-prod dev gen-prod clean

compile-prod:
	(cd client && bun run build)
	@mkdir -p $(BIN_DIR)
	@command -v bun > /dev/null 2>&1 || { echo "'Bun' is not installed. Please install it first."; exit 1; }
	@cp $$(command -v bun) $(BIN_DIR)
	CGO_ENABLED=0 GOOS=linux go build -ldflags "-s -w -X main.Environment=production -X main.Port=$(PORT) -X main.Version=$(VERSION)" -trimpath -buildvcs=false -o $(BIN_DIR)/$(APP_NAME)-$(VERSION) ./cmd

dev:
	@echo "Starting development servers..."
	@( \
		pids=""; \
		cleanup() { \
			echo "Gracefully shutting down all servers..."; \
			for pid in $$pids; do \
				if kill -0 $$pid 2>/dev/null; then \
					kill -TERM $$pid 2>/dev/null || true; \
				fi; \
			done; \
			sleep 0.5; \
			for pid in $$pids; do \
				if kill -0 $$pid 2>/dev/null; then \
					kill -KILL $$pid 2>/dev/null || true; \
				fi; \
			done; \
			wait 2>/dev/null || true; \
			echo "All servers stopped."; \
			exit 0; \
		}; \
		trap cleanup INT TERM EXIT; \
		echo "Starting backend server..."; \
		air & pids="$$pids $$!"; \
		echo "Starting frontend dev server..."; \
		(cd client && bun run dev) & pids="$$pids $$!"; \
		echo "Starting render server..."; \
		(cd client && bun run render:dev) & pids="$$pids $$!"; \
		echo "All development servers started! Press Ctrl+C to stop all servers."; \
		wait; \
	)

# Files and folders to include in the archive
INCLUDE_FILES = \
	bin \
	shared \
	README.md \
	assets \
	start.sh \
	client/dist \
	client/scripts \
	client/package.json \
	client/bun.lock \
	client/tsconfig.json \
	client/tsconfig.app.json \
	client/tsconfig.node.json \
	client/vite.config.ts

gen-prod:
	@make compile-prod
	@mkdir -p $(OUTPUT_DIR)
	@tar -czf "$(OUTPUT_DIR)/$(TAR_FILE)" $(INCLUDE_FILES)
	@echo "Production archive created at $(OUTPUT_DIR)/$(TAR_FILE)"

clean:
	rm -rf $(BIN_DIR) $(OUTPUT_DIR) ./.cache ./client/dist
