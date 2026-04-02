#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Detect platform
const platform = process.platform;
const arch = process.arch;

// Map platform names
const platformMap = {
  'darwin': 'macos',
  'linux': 'linux',
  'win32': 'windows'
};

const archMap = {
  'x64': 'x86_64',
  'arm64': 'aarch64'
};

const npmPlatform = platformMap[platform];
const npmArch = archMap[arch];

if (!npmPlatform || !npmArch) {
  console.error(`Unsupported platform: ${platform}/${arch}`);
  process.exit(1);
}

const version = require(path.join(__dirname, '..', 'package.json')).version;
// Only download macOS ARM64 CLI binary
const binaryName = 'easy-skills-cli-macos-aarch64';

// GitHub releases URL
const baseUrl = `https://github.com/hdygxsj/easy-skills/releases/download/v${version}`;
const downloadUrl = `${baseUrl}/${binaryName}`;

// Installation paths
const npmDir = __dirname;
const binDir = path.join(npmDir, 'bin');
const targetPath = path.join(binDir, 'easy-skills');

function installBinary() {
  console.log(`Installing easy-skills ${version} for ${npmPlatform}/${npmArch}...`);

  // Create bin directory if it doesn't exist
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  // Check if binary already exists and is up to date
  if (fs.existsSync(targetPath)) {
    try {
      const existingVersion = execSync(`"${targetPath}" --version`, { encoding: 'utf8' }).trim();
      if (existingVersion.includes(version)) {
        console.log('Binary already up to date.');
        return;
      }
    } catch (e) {
      // Binary might be corrupted, re-download
      console.log('Re-downloading binary...');
    }
  }

  // Download binary
  console.log(`Downloading from ${downloadUrl}...`);

  const https = require('https');
  const http = require('http');
  const url = new URL(downloadUrl);
  const protocol = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const request = protocol.get(downloadUrl, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        const redirectUrl = response.headers.location;
        console.log(`Following redirect to ${redirectUrl}...`);
        protocol.get(redirectUrl, handleResponse).on('error', reject);
      } else {
        handleResponse(response);
      }
    });

    function handleResponse(response) {
      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with status ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(targetPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        // Make executable on Unix
        if (platform !== 'win32') {
          fs.chmodSync(targetPath, 0o755);
        }
        console.log(`Installed to ${targetPath}`);
        resolve();
      });
    }

    request.on('error', reject);
  });
}

// Run installation
installBinary().catch((err) => {
  console.error('Installation failed:', err.message);
  console.error('You can manually download from: https://github.com/hdygxsj/easy-skills/releases');
  process.exit(1);
});
