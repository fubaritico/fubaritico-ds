#!/bin/bash

VERSION_TYPE="${1:-patch}"

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "\033[0;31mError: Invalid version type. Must be one of: patch, minor, major\033[0m"
    exit 1
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${2:-$GREEN}$1${NC}"
}

check_status() {
    if [ $? -eq 0 ]; then
        log "✓ $1 completed successfully"
    else
        log "✗ $1 failed" "$RED"
        exit 1
    fi
}

if [ -f ../../.env ]; then
    log "Loading environment variables from .env file..." "$YELLOW"
    export $(cat ../../.env | grep -v '^#' | xargs)
else
    log ".env file not found at root. Please create one" "$RED"
    exit 1
fi

if [ -z "$NPM_TOKEN" ]; then
    log "NPM_TOKEN is not set in .env file" "$RED"
    log "Please add your NPM_TOKEN to the .env file" "$YELLOW"
    exit 1
fi

log "Configuring git..." "$YELLOW"
git config --local version.commitTag true
git config --local tag.gpgSign false
git config --local version.tagName "shared-v%s"
check_status "Git configuration"

log "Configuring npm authentication..." "$YELLOW"
cat > .npmrc << EOL
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
registry=https://registry.npmjs.org/
@fubaritico-ds:registry=https://registry.npmjs.org/
always-auth=true

strict-peer-dependencies=false
auto-install-peers=true
resolution-mode=highest
public-hoist-pattern[]=@storybook/*
EOL
check_status "NPM authentication configuration"

log "Building package..." "$YELLOW"
pnpm build
check_status "Build"

log "Creating new version..." "$YELLOW"
pnpm version "$VERSION_TYPE"
check_status "Version bump"

# Generate changelog
log "Generating changelog..." "$YELLOW"
pnpm exec conventional-changelog -p angular -r 0 --path . > CHANGELOG.md
check_status "Changelog generation"

# Add changelog to git
git add CHANGELOG.md
git commit -m "docs(shared): update changelog for version bump" --no-verify
check_status "Changelog commit"

log "Publishing package..." "$YELLOW"
pnpm publish --no-git-checks
check_status "Publish"

CURRENT_VERSION=$(node -p "require('./package.json').version")
log "Ensuring tag shared-v${CURRENT_VERSION} exists..." "$YELLOW"
git tag -a "shared-v${CURRENT_VERSION}" -m "shared Version ${CURRENT_VERSION}" || true
check_status "Tag creation"

log "Pushing new version to repository..." "$YELLOW"
git push origin release/shared && git push origin --tags
check_status "Git push"

log "Cleaning up..." "$YELLOW"
rm -f .npmrc
unset NPM_TOKEN
check_status "Cleanup"

log "🎉 Package published successfully!" "$GREEN"
