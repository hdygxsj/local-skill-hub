.PHONY: all build build-all test clean dev serve install release dist

# Default target
all: build

# Build Go CLI with embedded web UI
build:
	@echo "Building web UI..."
	cd web && npm install && npm run build
	@echo "Copying web dist to CLI..."
	cp -r web/dist internal/cli/dist
	@echo "Building CLI..."
	go build -o easy-skills ./cmd/easy-skills
	@echo "Done! Binary: ./easy-skills"

# Build CLI only (requires web/dist to exist)
build-cli:
	go build -o easy-skills ./cmd/easy-skills

# Build web UI only
build-web:
	cd web && npm run build
	cp -r web/dist internal/cli/dist

# Clean build artifacts
clean:
	rm -rf easy-skills
	rm -rf web/dist
	rm -rf internal/cli/dist
	rm -rf releases/*

# Run web dev server
dev:
	cd web && npm run dev

# Run web dev server and serve CLI
dev-all: build-web
	go run ./cmd/easy-skills serve --dev

# Start the GUI server
serve:
	./easy-skills serve

# Start the GUI server in dev mode
serve-dev:
	./easy-skills serve --dev

# Install to system
install:
	go install ./cmd/easy-skills

# Build Tauri Mac App and create dmg
build-tauri:
	cd src-tauri && cargo tauri build
	@echo "Creating dmg installer..."
	cd target/release/bundle/macos && hdiutil create -volname "Easy Skills" -srcfolder "Easy Skills.app" -ov -format UDZO "Easy Skills.dmg"

# Create source code archive
source-tar:
	git archive -o releases/easy-skills-source.tar.gz HEAD

# Full release build: CLI + Mac App + Source
release: build build-tauri source-tar
	@echo "Moving artifacts to releases/..."
	mkdir -p releases
	mv easy-skills releases/
	mv src-tauri/target/release/bundle/macos/Easy\ Skills.dmg releases/ 2>/dev/null || true
	mv src-tauri/target/release/bundle/macos/Easy\ Skills.app releases/ 2>/dev/null || true
	@echo "Release artifacts:"
	@ls -la releases/
