.PHONY: all build build-all test clean dev serve install release dist build-cross upload-npm npm-publish

# Default target
all: build

# Build Go CLI with embedded web UI
build:
	@echo "Building web UI..."
	cd web && npm install && npm run build
	@echo "Copying web dist to CLI..."
	cp -r web/dist internal/cli/dist
	@echo "Copying skills to dist..."
	cp -r skills internal/cli/dist/
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
	cp -r skills internal/cli/dist/

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

# Build Tauri Mac App bundle (app + dmg)
build-tauri:
	@echo "Copying web assets for Tauri..."
	cp -r web/dist src-tauri/assets
	cp -r skills src-tauri/assets/
	cd src-tauri && cargo tauri build
	@echo "Copying frontend assets to app bundle..."
	cp -r src-tauri/assets/* "src-tauri/target/release/bundle/macos/Easy Skills.app/Contents/Resources/"
	@echo "Fixing dmg to include assets..."
	@./scripts/fix-dmg.sh
	@echo "Moving bundles to releases..."
	mkdir -p releases
	mv src-tauri/target/release/bundle/macos/*.app releases/ 2>/dev/null || true
	mv src-tauri/target/release/bundle/dmg/*.dmg releases/ 2>/dev/null || true

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

# Cross-compile Go CLI for macOS ARM64 only
build-cross:
	@echo "Building macOS ARM64 binary..."
	@mkdir -p releases/bin
	# macOS ARM64
	GOOS=darwin GOARCH=arm64 go build -o releases/bin/easy-skills-cli-macos-aarch64 ./cmd/easy-skills
	@echo "Cross-platform binaries built:"
	@ls -la releases/bin/

# Upload cross-platform binaries to GitHub Releases
upload-npm:
	@echo "Setting up npm package..."
	@mkdir -p npm/bin
	@mkdir -p npm/scripts
	@echo "Copying cross-platform binaries to npm package..."
	cp releases/bin/* npm/bin/
	@echo "Ready for npm publish. Run: cd npm && npm publish"
	@ls -la npm/bin/

# Publish npm package (requires GitHub Releases to be created first)
npm-publish:
	@cd npm && npm publish --access public
