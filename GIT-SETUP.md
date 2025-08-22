# Git Repository Setup

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `wp-acf-block-generator`
3. Make it **Public** (so it can be installed via package.json)
4. Don't initialize with README (we already have one)
5. Copy the repository URL (e.g., `https://github.com/yourusername/wp-acf-block-generator.git`)

## Step 2: Update Package Configuration

Update the `package.json` repository URLs to match your GitHub username:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOURUSERNAME/wp-acf-block-generator.git"
  },
  "bugs": {
    "url": "https://github.com/YOURUSERNAME/wp-acf-block-generator/issues"
  },
  "homepage": "https://github.com/YOURUSERNAME/wp-acf-block-generator#readme"
}
```

## Step 3: Push to GitHub

```bash
# From the package directory
cd packages/wp-acf-block-generator

# Add your remote (replace with your GitHub URL)
git remote add origin https://github.com/yourusername/wp-acf-block-generator.git

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: WordPress ACF Block Generator v1.0.0"

# Push to GitHub
git push -u origin main
```

## Step 4: Using in Projects

Once published to GitHub, you can use it in any project:

### Option A: Install from Git URL

```bash
# Install latest from main branch
npm install git+https://github.com/yourusername/wp-acf-block-generator.git

# Install specific version/tag
npm install git+https://github.com/yourusername/wp-acf-block-generator.git#v1.0.0

# Install from specific branch
npm install git+https://github.com/yourusername/wp-acf-block-generator.git#develop
```

### Option B: Add to package.json

```json
{
  "devDependencies": {
    "wp-acf-block-generator": "git+https://github.com/yourusername/wp-acf-block-generator.git"
  },
  "scripts": {
    "generate-block": "wp-block-gen",
    "block:quick": "wp-block-gen --quick",
    "list-blocks": "wp-block-gen list"
  }
}
```

Then run:
```bash
npm install
```

### Option C: Install Specific Version

```json
{
  "devDependencies": {
    "wp-acf-block-generator": "git+https://github.com/yourusername/wp-acf-block-generator.git#v1.0.0"
  }
}
```

## Step 5: Version Management

### Creating Releases

1. Update version in `package.json`:
   ```json
   {
     "version": "1.1.0"
   }
   ```

2. Commit and tag:
   ```bash
   git add package.json
   git commit -m "Bump version to 1.1.0"
   git tag v1.1.0
   git push origin main --tags
   ```

3. Create GitHub Release (optional but recommended):
   - Go to your repository on GitHub
   - Click "Releases" → "Create a new release"
   - Tag: `v1.1.0`
   - Title: `Version 1.1.0`
   - Describe changes

### Using Specific Versions

Projects can then install specific versions:

```json
{
  "devDependencies": {
    "wp-acf-block-generator": "git+https://github.com/yourusername/wp-acf-block-generator.git#v1.1.0"
  }
}
```

## Step 6: Publishing to NPM (Optional)

If you want to publish to npm registry as well:

```bash
# Login to npm
npm login

# Publish
npm publish

# Or test first
npm publish --dry-run
```

Then projects can install via:
```bash
npm install wp-acf-block-generator
```

## Example Project Setup

In any new WordPress theme project:

```bash
# Initialize npm project
npm init -y

# Install your block generator
npm install --save-dev git+https://github.com/yourusername/wp-acf-block-generator.git

# Add scripts to package.json
```

**package.json:**
```json
{
  "name": "my-wordpress-theme",
  "scripts": {
    "generate-block": "wp-block-gen",
    "block:quick": "wp-block-gen --quick",
    "list-blocks": "wp-block-gen list"
  },
  "devDependencies": {
    "wp-acf-block-generator": "git+https://github.com/yourusername/wp-acf-block-generator.git"
  }
}
```

**Usage:**
```bash
npm run generate-block     # Interactive mode
npm run block:quick        # Quick mode
npm run list-blocks        # List existing blocks
```

## Benefits of Git-Based Installation

1. **Private repositories** - Can be private if needed
2. **Version control** - Install specific versions/tags
3. **Free hosting** - No npm registry fees
4. **Direct access** - Install latest changes immediately
5. **Branch support** - Install from different branches
6. **Team sharing** - Easy to share with team members
