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

### Block Features

**block.json** - Modern Gutenberg configuration:

```json
{
	"name": "hero",
	"title": "Hero Section",
	"category": "custom-blocks",
	"icon": "admin-generic",
	"supports": {
		"align": ["wide", "full"],
		"jsx": true
	}
}
```

**template.php** - Secure, accessible template:

-   Custom anchor support
-   CSS class handling with alignment
-   ACF field integration with fallbacks
-   Proper escaping and sanitization
-   Tailwind CSS utilities

**style.css** - Tailwind-ready styles:

-   Component-specific classes
-   Editor-specific styling
-   Responsive design ready
-   Utility-first approach

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

3. **Enable ACF JSON** for version control:

```php
// ACF JSON save/load
add_filter('acf/settings/save_json', function() {
    return get_template_directory() . '/acf-json';
});

add_filter('acf/settings/load_json', function($paths) {
    $paths[] = get_template_directory() . '/acf-json';
    return $paths;
});
```

## Best Practices

### Block Naming

-   ✅ Use kebab-case (`hero-section`, `testimonial-grid`)
-   ✅ Be descriptive (`cta-banner` not `banner`)
-   ❌ Avoid generic names (`content`, `block`)

### Field Naming

-   ✅ Semantic names (`heading`, `description`, `image`)
-   ✅ Group with prefixes (`cta_text`, `cta_link`)
-   ❌ Avoid abbreviations

### Styling

-   ✅ Use Tailwind utilities when possible
-   ✅ Follow component-based structure
-   ✅ Add editor-specific styles
-   ✅ Test responsive behavior

## Development Workflow

1. **Generate block** with the tool
2. **Customize ACF fields** in WordPress admin (if generated)
3. **Update template** with your specific markup
4. **Style the block** with Tailwind utilities
5. **Test in editor** and frontend
6. **Create block patterns** for common layouts

## Advanced Usage

### Programmatic Usage

```javascript
const { BlockGenerator } = require("wp-acf-block-generator");

const generator = new BlockGenerator({
	blocksDir: "src/blocks",
	defaultCategory: "my-blocks",
});

// Generate block programmatically
generator.generateBlock("hero", {
	title: "Hero Section",
	description: "A landing page hero",
	category: "layout",
	icon: "admin-home",
	fields: true,
});
```

### Custom Templates

Override the default templates by extending the class:

```javascript
class CustomBlockGenerator extends BlockGenerator {
	generateTemplate(blockDir, blockName, options) {
		// Your custom template logic
	}
}
```

## Troubleshooting

### Common Issues

**Block not appearing in editor:**

-   Ensure ACF Pro is installed and active
-   Check block registration code in functions.php
-   Clear caching plugins

**Styles not loading:**

-   Verify Tailwind CSS is properly configured
-   Check file paths in templates
-   Ensure build process includes block styles

**ACF fields not working:**

-   Sync field groups in WordPress admin
-   Check location rules target correct block
-   Verify field names match template calls

### Getting Help

-   📖 Check the [documentation](https://github.com/stowez/wp-acf-block-generator)
-   🐛 Report issues on [GitHub](https://github.com/stowez/wp-acf-block-generator/issues)
-   💬 Ask questions in [discussions](https://github.com/stowez/wp-acf-block-generator/discussions)

## Contributing

Contributions are welcome! Please read our [contributing guide](CONTRIBUTING.md) and submit pull requests.

## License

MIT © [stowez](https://github.com/stowez)

## Changelog

### 1.0.0

-   Initial release
-   Interactive and quick modes
-   ACF integration
-   Tailwind CSS support
-   Auto theme detection
