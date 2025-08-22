# WordPress ACF Block Generator

🚀 An interactive CLI tool for generating WordPress blocks with Advanced Custom Fields (ACF) integration and Tailwind CSS support.

## Features

-   ✨ **Interactive Mode** - Guided prompts with smart validation
-   ⚡ **Quick Mode** - Minimal prompts with sensible defaults
-   🎯 **Smart Detection** - Automatically finds WordPress theme directory
-   🎨 **Tailwind Ready** - Pre-configured with Tailwind CSS utilities
-   🔧 **ACF Integration** - Generates field groups and JSON exports
-   📦 **Modern Blocks** - Gutenberg-compatible with block.json
-   🛡️ **Secure Templates** - Proper escaping and sanitization
-   🎪 **Flexible** - Configurable categories, icons, and templates

## Installation

### Global Installation (Recommended)

```bash
npm install -g wp-acf-block-generator
```

### Local Installation

```bash
# Install in your project
npm install --save-dev wp-acf-block-generator

# Add to package.json scripts
{
  "scripts": {
    "generate-block": "wp-block-gen"
  }
}
```

## Quick Start

Navigate to your WordPress theme directory and run:

```bash
# Interactive mode (recommended)
wp-block-gen

# Quick mode - minimal prompts
wp-block-gen --quick

# Direct mode
wp-block-gen hero --title="Hero Section" --fields
```

## Usage

### Interactive Mode

The easiest way to generate blocks with guided prompts:

```bash
wp-block-gen
```

This will walk you through:

-   Block name validation
-   Title suggestions
-   Category and icon recommendations
-   ACF field generation options
-   Visual summary and confirmation

### Quick Mode

For rapid development with minimal prompts:

```bash
wp-block-gen --quick
```

Only asks for block name and ACF fields preference, uses smart defaults for everything else.

### Direct Mode

Traditional command-line approach:

```bash
wp-block-gen <block-name> [options]
```

**Options:**

-   `--title=<title>` - Block display title
-   `--description=<desc>` - Block description
-   `--category=<category>` - Block category (default: custom-blocks)
-   `--icon=<icon>` - Block icon (default: admin-generic)
-   `--fields` - Generate sample ACF fields
-   `--interactive, -i` - Force interactive mode
-   `--quick, -q` - Force quick mode

### Examples

```bash
# Generate hero block with custom title
wp-block-gen hero --title="Hero Section"

# Generate testimonials block with ACF fields
wp-block-gen testimonials --fields

# Generate CTA block with all options
wp-block-gen cta-banner \
  --title="Call to Action" \
  --description="Promotional banner" \
  --category="marketing" \
  --icon="megaphone" \
  --fields

# List existing blocks
wp-block-gen list
```

## Generated Structure

Each block creates:

```
blocks/
└── your-block-name/
    ├── block.json       # Block configuration
    ├── template.php     # PHP template with ACF integration
    └── style.css        # Tailwind-ready styles

acf-json/                # If --fields is used
└── group_your_block_name.json
```

## Configuration

### Theme Integration

The tool automatically detects WordPress themes by looking for:

-   `style.css`
-   `functions.php`
-   `index.php`

It will search the current directory and parent directories to find your theme root.

### Custom Configuration

You can configure defaults by extending the BlockGenerator class:

```javascript
const { BlockGenerator } = require("wp-acf-block-generator");

const generator = new BlockGenerator({
	defaultCategory: "my-blocks",
	defaultIcon: "admin-home",
	blocksDir: "src/blocks",
	acfJsonDir: "acf-fields",
});

generator.run();
```

### WordPress Setup

1. **Install ACF Pro** in your WordPress site
2. **Add block registration** to your theme's `functions.php`:

```php
// Register ACF blocks automatically
function register_acf_blocks() {
    if (!function_exists('acf_register_block_type')) return;

    $blocks_dir = get_template_directory() . '/blocks';
    if (!is_dir($blocks_dir)) return;

    $blocks = array_filter(glob($blocks_dir . '/*'), 'is_dir');

    foreach ($blocks as $block_dir) {
        $block_name = basename($block_dir);
        $block_json = $block_dir . '/block.json';

        if (!file_exists($block_json)) continue;

        $config = json_decode(file_get_contents($block_json), true);
        $config['render_template'] = 'blocks/' . $block_name . '/template.php';

        acf_register_block_type($config);
    }
}
add_action('acf/init', 'register_acf_blocks');
```
