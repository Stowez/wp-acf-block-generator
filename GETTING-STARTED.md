# Getting Started with wp-acf-block-generator

## Installation

### Option 1: Global Installation (Recommended)

Install globally to use in any WordPress project:

```bash
npm install -g wp-acf-block-generator
```

Then use anywhere:

```bash
cd /path/to/your/wordpress-theme
wp-block-gen
```

### Option 2: Local Installation

Install in your WordPress theme:

```bash
npm install --save-dev wp-acf-block-generator
```

Add to your `package.json` scripts:

```json
{
  "scripts": {
    "generate-block": "wp-block-gen",
    "block:quick": "wp-block-gen --quick",
    "list-blocks": "wp-block-gen list"
  }
}
```

Use with npm:

```bash
npm run generate-block
```

## WordPress Theme Setup

1. **Install ACF Pro** on your WordPress site

2. **Add block registration** to your `functions.php`:

```php
<?php
/**
 * Register ACF blocks automatically
 */
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
        
        // Add style enqueue if style.css exists
        if (file_exists($block_dir . '/style.css')) {
            $config['enqueue_assets'] = function() use ($block_name) {
                wp_enqueue_style(
                    'block-' . $block_name,
                    get_template_directory_uri() . '/blocks/' . $block_name . '/style.css'
                );
            };
        }
        
        acf_register_block_type($config);
    }
}
add_action('acf/init', 'register_acf_blocks');

/**
 * ACF JSON save/load for version control
 */
add_filter('acf/settings/save_json', function() {
    return get_template_directory() . '/acf-json';
});

add_filter('acf/settings/load_json', function($paths) {
    $paths[] = get_template_directory() . '/acf-json';
    return $paths;
});

/**
 * Register custom block category
 */
function custom_block_categories($categories) {
    return array_merge([
        [
            'slug'  => 'custom-blocks',
            'title' => __('Custom Blocks'),
            'icon'  => 'admin-generic',
        ],
    ], $categories);
}
add_filter('block_categories_all', 'custom_block_categories');
```

3. **Create your first block**:

```bash
wp-block-gen
```

4. **Sync ACF fields** (if generated):
   - Go to WordPress Admin → Custom Fields → Sync
   - Sync the generated field group

5. **Use in Gutenberg**:
   - Edit a page/post
   - Add block → Custom Blocks → Your Block

## Quick Example

Generate a hero block:

```bash
# Interactive mode
wp-block-gen

# Or direct mode
wp-block-gen hero --title="Hero Section" --fields
```

This creates:

```
your-theme/
├── blocks/
│   └── hero/
│       ├── block.json
│       ├── template.php
│       └── style.css
└── acf-json/
    └── group_hero.json
```

## Next Steps

1. **Customize the template** (`blocks/hero/template.php`)
2. **Style with Tailwind** (`blocks/hero/style.css`)
3. **Add more ACF fields** in WordPress admin
4. **Create block patterns** for common layouts
5. **Test in editor and frontend**

Happy block building! 🚀
