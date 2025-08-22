#!/bin/bash

# GitHub Repository Setup Script for wp-acf-block-generator

echo "🚀 GitHub Repository Setup for wp-acf-block-generator"
echo "================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the package directory?"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized. Run 'git init' first."
    exit 1
fi

# Check if there are commits
if ! git rev-parse HEAD >/dev/null 2>&1; then
    echo "❌ Error: No commits found. Please commit your files first."
    exit 1
fi

echo "📋 Current package info:"
echo "Name: $(node -p "require('./package.json').name")"
echo "Version: $(node -p "require('./package.json').version")"
echo ""

echo "🔗 Step 1: Create GitHub Repository"
echo "1. Go to https://github.com/new"
echo "2. Repository name: wp-acf-block-generator"
echo "3. Make it PUBLIC (required for npm install from git)"
echo "4. Don't initialize with README (we already have one)"
echo "5. Copy the repository URL"
echo ""

read -p "📝 Enter your GitHub repository URL (e.g., https://github.com/username/wp-acf-block-generator.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Repository URL is required!"
    exit 1
fi

# Extract username from URL for package.json updates
USERNAME=$(echo "$REPO_URL" | sed -n 's/.*github\.com\/\([^/]*\)\/.*/\1/p')

if [ -z "$USERNAME" ]; then
    echo "❌ Could not extract username from URL. Please check the format."
    exit 1
fi

echo ""
echo "🔧 Step 2: Updating package.json with your repository info..."

# Update package.json repository URLs
node -e "
const pkg = require('./package.json');
pkg.repository.url = '$REPO_URL';
pkg.bugs.url = 'https://github.com/$USERNAME/wp-acf-block-generator/issues';
pkg.homepage = 'https://github.com/$USERNAME/wp-acf-block-generator#readme';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

echo "✅ Updated package.json repository URLs"

# Add remote
echo ""
echo "🔗 Step 3: Adding GitHub remote..."
git remote add origin "$REPO_URL" 2>/dev/null || {
    echo "ℹ️  Remote 'origin' already exists, updating URL..."
    git remote set-url origin "$REPO_URL"
}

echo "✅ Added GitHub remote: $REPO_URL"

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo ""
    echo "📝 Committing package.json updates..."
    git add package.json
    git commit -m "Update repository URLs in package.json"
fi

# Push to GitHub
echo ""
echo "🚀 Step 4: Pushing to GitHub..."
echo "This will push your code to GitHub..."
read -p "Continue? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    git push -u origin main || git push -u origin master
    echo ""
    echo "🎉 Successfully pushed to GitHub!"
else
    echo "⏸️  Skipping push. You can push manually later with:"
    echo "   git push -u origin main"
fi

echo ""
echo "📦 Step 5: Usage in other projects"
echo "Add to package.json in any WordPress theme:"
echo ""
echo '{
  "devDependencies": {
    "wp-acf-block-generator": "git+'$REPO_URL'"
  },
  "scripts": {
    "generate-block": "wp-block-gen",
    "block:quick": "wp-block-gen --quick",
    "list-blocks": "wp-block-gen list"
  }
}'
echo ""
echo "Then run: npm install"
echo ""
echo "✅ Setup complete! Your package is now available on GitHub."
echo ""
echo "📚 Next steps:"
echo "• Test installation in another project"
echo "• Create releases for version management"
echo "• Consider publishing to npm registry"
echo "• Share with your team!"
