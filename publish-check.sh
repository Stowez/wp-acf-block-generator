#!/bin/bash

# Prepare wp-acf-block-generator for publishing

echo "🚀 Preparing wp-acf-block-generator for publishing..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the package directory?"
    exit 1
fi

# Check if all required files exist
echo "📋 Checking required files..."

FILES=("bin/wp-block-gen.js" "lib/index.js" "README.md" "package.json")
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

# Run tests
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed!"
    exit 1
fi

# Check package size
echo "📦 Package info:"
npm pack --dry-run

echo ""
echo "✅ Package is ready for publishing!"
echo ""
echo "Next steps:"
echo "1. Review the package contents above"
echo "2. Update version in package.json if needed"
echo "3. Run 'npm publish' to publish to npm"
echo "4. Or run 'npm publish --dry-run' to test first"
echo ""
echo "For private registry:"
echo "npm publish --registry=your-private-registry"
