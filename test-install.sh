#!/bin/bash

# Test Installation Script
# This script tests installing the package from git in a temporary directory

echo "🧪 Testing wp-acf-block-generator Installation"
echo "=============================================="
echo ""

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Created temp directory: $TEMP_DIR"

cd "$TEMP_DIR"

# Create a minimal package.json
echo "📝 Creating test package.json..."
cat > package.json << 'EOF'
{
  "name": "test-project",
  "version": "1.0.0",
  "scripts": {
    "generate-block": "wp-block-gen",
    "block:quick": "wp-block-gen --quick"
  }
}
EOF

echo "✅ Created test package.json"

# Get the repository URL
if [ -z "$1" ]; then
    echo "❌ Please provide the GitHub repository URL as first argument"
    echo "Usage: ./test-install.sh https://github.com/username/wp-acf-block-generator.git"
    rm -rf "$TEMP_DIR"
    exit 1
fi

REPO_URL="$1"

echo ""
echo "📦 Installing package from: $REPO_URL"

# Install the package
npm install "git+$REPO_URL"

if [ $? -eq 0 ]; then
    echo "✅ Package installed successfully!"
    
    echo ""
    echo "🔍 Testing CLI command..."
    
    # Test the CLI
    if npx wp-block-gen --help > /dev/null 2>&1; then
        echo "✅ CLI command works!"
        
        echo ""
        echo "📋 Available commands:"
        npx wp-block-gen --help
        
    else
        echo "❌ CLI command failed"
    fi
    
    echo ""
    echo "📦 Package info:"
    npm list wp-acf-block-generator
    
else
    echo "❌ Package installation failed"
fi

echo ""
echo "🧹 Cleaning up..."
cd /
rm -rf "$TEMP_DIR"
echo "✅ Test complete!"
