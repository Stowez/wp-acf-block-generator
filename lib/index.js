const fs = require("fs");
const path = require("path");
const readline = require("readline");

/**
 * WordPress ACF Block Generator
 * Interactive tool for generating WordPress blocks with ACF integration
 */
class BlockGenerator {
	constructor(options = {}) {
		// Configuration with defaults
		this.config = {
			blocksDir: options.blocksDir || "blocks",
			acfJsonDir: options.acfJsonDir || "acf-json",
			defaultCategory: options.defaultCategory || "custom-blocks",
			defaultIcon: options.defaultIcon || "admin-generic",
			...options
		};

		// Determine working directory
		this.workingDir = this.findWorkingDirectory();
		this.blocksPath = path.join(this.workingDir, this.config.blocksDir);
		this.acfJsonPath = path.join(this.workingDir, this.config.acfJsonDir);

		// Colors for console output
		this.colors = {
			reset: "\x1b[0m",
			bright: "\x1b[1m",
			red: "\x1b[31m",
			green: "\x1b[32m",
			yellow: "\x1b[33m",
			blue: "\x1b[34m",
			magenta: "\x1b[35m",
			cyan: "\x1b[36m",
		};
	}

	/**
	 * Find the working directory (theme root or current directory)
	 */
	findWorkingDirectory() {
		let currentDir = process.cwd();
		
		// Look for WordPress theme indicators
		const themeIndicators = [
			'style.css',
			'functions.php',
			'index.php'
		];

		// Check current directory first
		const hasThemeFiles = themeIndicators.some(file => 
			fs.existsSync(path.join(currentDir, file))
		);

		if (hasThemeFiles) {
			return currentDir;
		}

		// Check if we're in a subdirectory of a theme
		let parentDir = currentDir;
		while (parentDir !== path.dirname(parentDir)) {
			parentDir = path.dirname(parentDir);
			const hasThemeFilesInParent = themeIndicators.some(file => 
				fs.existsSync(path.join(parentDir, file))
			);
			
			if (hasThemeFilesInParent) {
				return parentDir;
			}
		}

		// Default to current directory
		return currentDir;
	}

	/**
	 * Console logging with colors
	 */
	log(message, color = "reset") {
		console.log(`${this.colors[color]}${message}${this.colors.reset}`);
	}

	error(message) {
		this.log(`❌ Error: ${message}`, "red");
		process.exit(1);
	}

	success(message) {
		this.log(`✅ ${message}`, "green");
	}

	warning(message) {
		this.log(`⚠️  ${message}`, "yellow");
	}

	info(message) {
		this.log(`ℹ️  ${message}`, "blue");
	}

	/**
	 * Main entry point
	 */
	async run() {
		try {
			const parseResult = this.parseArgs();
			
			if (parseResult.interactive) {
				let blockOptions;
				
				if (parseResult.mode === "quick") {
					blockOptions = await this.getBlockOptionsQuick();
				} else {
					blockOptions = await this.getBlockOptionsInteractively();
				}
				
				const { blockName, options } = blockOptions;
				this.generateBlock(blockName, options);
			} else {
				const { blockName, options } = parseResult;
				this.generateBlock(blockName, options);
			}
		} catch (err) {
			this.error(err.message);
		}
	}

	/**
	 * Parse command line arguments
	 */
	parseArgs() {
		const args = process.argv.slice(2);

		if (args.includes("--help") || args.includes("-h")) {
			this.showHelp();
			process.exit(0);
		}

		if (args.length > 0 && args[0] === "list") {
			this.listBlocks();
			process.exit(0);
		}

		// Check for interactive or quick mode
		const isInteractive = args.includes("--interactive") || args.includes("-i");
		const isQuick = args.includes("--quick") || args.includes("-q");

		// If no block name provided or interactive/quick flags, use interactive mode
		if (args.length === 0 || isInteractive || isQuick) {
			return { 
				interactive: true, 
				mode: isQuick ? "quick" : "full" 
			};
		}

		const blockName = args[0];
		const options = {};

		// Parse options
		for (let i = 1; i < args.length; i++) {
			const arg = args[i];
			if (arg.startsWith("--")) {
				const [key, value] = arg.substring(2).split("=");
				options[key] = value || true;
			}
		}

		return { blockName, options, interactive: false };
	}

	/**
	 * Show help information
	 */
	showHelp() {
		this.log("🚀 WordPress ACF Block Generator", "cyan");
		this.log("");
		this.log("Usage:", "bright");
		this.log("  wp-block-gen                              # Interactive mode (recommended)");
		this.log("  wp-block-gen <block-name> [options]");
		this.log("  wp-block-gen list");
		this.log("");
		this.log("Modes:", "bright");
		this.log("  --interactive, -i         Force interactive mode with full prompts");
		this.log("  --quick, -q              Quick mode with minimal prompts");
		this.log("");
		this.log("Options:", "bright");
		this.log("  --title=<title>           Block display title");
		this.log("  --description=<desc>      Block description");
		this.log("  --category=<category>     Block category (default: custom-blocks)");
		this.log("  --icon=<icon>             Block icon (default: admin-generic)");
		this.log("  --fields                  Generate sample ACF fields");
		this.log("  --help, -h                Show this help");
		this.log("");
		this.log("Examples:", "bright");
		this.log("  wp-block-gen                              # Interactive prompts");
		this.log("  wp-block-gen --quick                      # Quick mode");
		this.log('  wp-block-gen hero --title="Hero Section"');
		this.log("  wp-block-gen testimonials --fields");
		this.log("  wp-block-gen list");
	}

	/**
	 * Validate block name
	 */
	validateBlockName(blockName) {
		if (!/^[a-z0-9-]+$/.test(blockName)) {
			this.error(
				"Block name must be lowercase letters, numbers, and hyphens only."
			);
		}
	}

	/**
	 * Ensure directory exists
	 */
	ensureDirectory(dir) {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
			this.info(`Created directory: ${dir}`);
		}
	}

	/**
	 * Create readline interface
	 */
	createReadlineInterface() {
		return readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
	}

	/**
	 * Ask a question with optional default
	 */
	askQuestion(rl, question, defaultValue = "") {
		return new Promise((resolve) => {
			const prompt = defaultValue
				? `${question} (${defaultValue}): `
				: `${question}: `;
			
			rl.question(prompt, (answer) => {
				resolve(answer.trim() || defaultValue);
			});
		});
	}

	/**
	 * Ask yes/no question
	 */
	askYesNo(rl, question, defaultValue = false) {
		return new Promise((resolve) => {
			const defaultText = defaultValue ? "Y/n" : "y/N";
			rl.question(`${question} (${defaultText}): `, (answer) => {
				const normalizedAnswer = answer.trim().toLowerCase();
				if (normalizedAnswer === "") {
					resolve(defaultValue);
				} else {
					resolve(normalizedAnswer === "y" || normalizedAnswer === "yes");
				}
			});
		});
	}

	/**
	 * Interactive mode with full prompts
	 */
	async getBlockOptionsInteractively() {
		const rl = this.createReadlineInterface();
		
		try {
			this.log("🚀 Interactive Block Generator", "cyan");
			this.log("Let's create your custom block step by step!", "blue");
			this.log("");

			// Get block name
			let blockName;
			while (true) {
				blockName = await this.askQuestion(rl, "📝 Block name (kebab-case, e.g., hero-section)");
				
				if (!blockName) {
					this.warning("Block name is required!");
					continue;
				}
				
				if (!/^[a-z0-9-]+$/.test(blockName)) {
					this.warning("Block name must be lowercase letters, numbers, and hyphens only!");
					continue;
				}
				
				// Check if block already exists
				const blockDir = path.join(this.blocksPath, blockName);
				if (fs.existsSync(blockDir)) {
					this.warning(`Block '${blockName}' already exists!`);
					continue;
				}
				
				this.success(`Good choice! '${blockName}' is available.`);
				break;
			}

			// Suggest title based on block name
			const suggestedTitle = blockName
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			this.log("");
			const title = await this.askQuestion(
				rl,
				"📋 Block title (display name in editor)",
				suggestedTitle
			);

			this.log("");
			const description = await this.askQuestion(
				rl,
				"📖 Block description (helpful for editors)",
				`A custom ${blockName} block`
			);

			// Category suggestions
			this.log("");
			this.info("💡 Available categories:");
			this.log("   • custom-blocks (recommended - custom theme blocks)", "green");
			this.log("   • layout (layout and structure blocks)");
			this.log("   • media (image, video, gallery blocks)");
			this.log("   • text (content and typography blocks)");
			this.log("   • design (decorative and visual blocks)");
			this.log("");

			const category = await this.askQuestion(
				rl,
				"📂 Block category",
				this.config.defaultCategory
			);

			// Icon suggestions
			this.log("");
			this.info("💡 Popular block icons:");
			this.log("   • admin-generic (recommended - default block icon)", "green");
			this.log("   • admin-home (hero, landing sections)");
			this.log("   • admin-users (testimonials, team)");
			this.log("   • admin-comments (content, text blocks)");
			this.log("   • admin-media (images, galleries)");
			this.log("   • admin-page (layouts, containers)");
			this.log("   • megaphone (CTA, promotional)");
			this.log("   • admin-tools (utility blocks)");
			this.log("");

			const icon = await this.askQuestion(rl, "🎨 Block icon", this.config.defaultIcon);

			this.log("");
			const generateFields = await this.askYesNo(
				rl,
				"🔧 Generate sample ACF fields? (heading + content fields)",
				true
			);

			this.log("");
			this.log("=" .repeat(50), "bright");
			this.log("📋 Block Summary:", "bright");
			this.log("=" .repeat(50), "bright");
			this.log(`   Name: ${blockName}`, "cyan");
			this.log(`   Title: ${title}`, "cyan");
			this.log(`   Description: ${description}`, "cyan");
			this.log(`   Category: ${category}`, "cyan");
			this.log(`   Icon: ${icon}`, "cyan");
			this.log(`   ACF Fields: ${generateFields ? "Yes" : "No"}`, "cyan");
			this.log("=" .repeat(50), "bright");

			const confirm = await this.askYesNo(rl, "✨ Generate this block?", true);

			if (!confirm) {
				this.warning("Block generation cancelled.");
				process.exit(0);
			}

			this.log(""); // Add spacing before generation starts

			return {
				blockName,
				options: {
					title,
					description,
					category,
					icon,
					fields: generateFields,
				},
			};
		} finally {
			rl.close();
		}
	}

	/**
	 * Quick mode with minimal prompts
	 */
	async getBlockOptionsQuick() {
		const rl = this.createReadlineInterface();
		
		try {
			this.log("⚡ Quick Block Generator", "cyan");
			this.log("Just the essentials!", "blue");
			this.log("");

			// Get block name
			let blockName;
			while (true) {
				blockName = await this.askQuestion(rl, "📝 Block name (kebab-case)");
				
				if (!blockName) {
					this.warning("Block name is required!");
					continue;
				}
				
				if (!/^[a-z0-9-]+$/.test(blockName)) {
					this.warning("Block name must be lowercase letters, numbers, and hyphens only!");
					continue;
				}
				
				// Check if block already exists
				const blockDir = path.join(this.blocksPath, blockName);
				if (fs.existsSync(blockDir)) {
					this.warning(`Block '${blockName}' already exists!`);
					continue;
				}
				
				break;
			}

			// Auto-generate title
			const title = blockName
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			const generateFields = await this.askYesNo(
				rl,
				"🔧 Generate ACF fields?",
				true
			);

			this.success(`Creating '${blockName}' (${title}) with ${generateFields ? "ACF fields" : "no fields"}`);

			return {
				blockName,
				options: {
					title,
					description: `A custom ${blockName} block`,
					category: this.config.defaultCategory,
					icon: this.config.defaultIcon,
					fields: generateFields,
				},
			};
		} finally {
			rl.close();
		}
	}

	/**
	 * Generate block.json file
	 */
	generateBlockJson(blockDir, blockName, options) {
		const title =
			options.title ||
			blockName
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

		const description = options.description || `A custom ${blockName} block`;
		const category = options.category || this.config.defaultCategory;
		const icon = options.icon || this.config.defaultIcon;

		const blockJson = {
			name: blockName,
			title: title,
			description: description,
			category: category,
			icon: icon,
			keywords: [blockName, "custom"],
			supports: {
				align: ["wide", "full"],
				mode: "edit",
				jsx: true,
			},
		};

		const filePath = path.join(blockDir, "block.json");
		fs.writeFileSync(filePath, JSON.stringify(blockJson, null, 2));
		this.info(`Generated: block.json`);
	}

	/**
	 * Generate template.php file
	 */
	generateTemplate(blockDir, blockName, options) {
		const title =
			options.title ||
			blockName
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

		const template = `<?php
/**
 * ${title} Block Template
 *
 * @param   array $block The block settings and attributes.
 * @param   string $content The block inner HTML (empty).
 * @param   bool $is_preview True during AJAX preview.
 * @param   (int|string) $post_id The post ID this block is saved to.
 */

// Create id attribute allowing for custom "anchor" value.
$id = '${blockName}-' . $block['id'];
if( !empty($block['anchor']) ) {
    $id = $block['anchor'];
}

// Create class attribute allowing for custom "className" and "align" values.
$className = '${blockName}-block';
if( !empty($block['className']) ) {
    $className .= ' ' . $block['className'];
}
if( !empty($block['align']) ) {
    $className .= ' align' . $block['align'];
}

// Load values and assign defaults.
$heading = get_field('heading') ?: 'Your heading here';
$content = get_field('content') ?: 'Your content here';

?>
<div id="<?php echo esc_attr($id); ?>" class="<?php echo esc_attr($className); ?>">
    <div class="container mx-auto px-4">
        <?php if( $heading ): ?>
            <h2 class="text-3xl font-bold mb-4"><?php echo esc_html($heading); ?></h2>
        <?php endif; ?>
        
        <?php if( $content ): ?>
            <div class="content">
                <?php echo wp_kses_post($content); ?>
            </div>
        <?php endif; ?>
    </div>
</div>`;

		const filePath = path.join(blockDir, "template.php");
		fs.writeFileSync(filePath, template);
		this.info(`Generated: template.php`);
	}

	/**
	 * Generate style.css file
	 */
	generateStyles(blockDir, blockName) {
		const css = `/* ${blockName} Block Styles */
.${blockName}-block {
    @apply py-12;
}

.${blockName}-block .content {
    @apply prose max-w-none;
}

/* Editor styles */
.block-editor-block-list__layout .${blockName}-block {
    @apply border border-gray-200 border-dashed;
}`;

		const filePath = path.join(blockDir, "style.css");
		fs.writeFileSync(filePath, css);
		this.info(`Generated: style.css`);
	}

	/**
	 * Generate ACF field group
	 */
	generateAcfFields(blockName, options) {
		const title =
			options.title ||
			blockName
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

		const fieldGroupKey = "group_" + blockName.replace(/-/g, "_");
		const fieldKeyPrefix = "field_" + blockName.replace(/-/g, "_");

		const fieldGroup = {
			key: fieldGroupKey,
			title: title + " Fields",
			fields: [
				{
					key: fieldKeyPrefix + "_heading",
					label: "Heading",
					name: "heading",
					type: "text",
					instructions: "Enter the heading for this block",
					required: 0,
					conditional_logic: 0,
					wrapper: {
						width: "",
						class: "",
						id: "",
					},
					default_value: "",
					placeholder: "",
					prepend: "",
					append: "",
					maxlength: "",
				},
				{
					key: fieldKeyPrefix + "_content",
					label: "Content",
					name: "content",
					type: "wysiwyg",
					instructions: "Enter the content for this block",
					required: 0,
					conditional_logic: 0,
					wrapper: {
						width: "",
						class: "",
						id: "",
					},
					default_value: "",
					tabs: "all",
					toolbar: "full",
					media_upload: 1,
					delay: 1,
				},
			],
			location: [
				[
					{
						param: "block",
						operator: "==",
						value: "acf/" + blockName,
					},
				],
			],
			menu_order: 0,
			position: "normal",
			style: "default",
			label_placement: "top",
			instruction_placement: "label",
			hide_on_screen: "",
			active: true,
			description: "",
		};

		this.ensureDirectory(this.acfJsonPath);
		const filename = fieldGroupKey + ".json";
		const filePath = path.join(this.acfJsonPath, filename);
		fs.writeFileSync(filePath, JSON.stringify(fieldGroup, null, 2));
		this.info(`Generated: acf-json/${filename}`);
	}

	/**
	 * List existing blocks
	 */
	listBlocks() {
		this.log("📦 Existing Blocks:", "cyan");

		if (!fs.existsSync(this.blocksPath)) {
			this.warning("No blocks directory found.");
			return;
		}

		const blocks = fs.readdirSync(this.blocksPath).filter((item) => {
			return fs.statSync(path.join(this.blocksPath, item)).isDirectory();
		});

		if (blocks.length === 0) {
			this.warning("No blocks found.");
			return;
		}

		blocks.forEach((blockName) => {
			const blockJsonPath = path.join(this.blocksPath, blockName, "block.json");

			if (fs.existsSync(blockJsonPath)) {
				try {
					const blockJson = JSON.parse(
						fs.readFileSync(blockJsonPath, "utf8")
					);
					this.log(`  - ${blockName} (${blockJson.title})`, "green");
				} catch (e) {
					this.log(`  - ${blockName} (invalid block.json)`, "red");
				}
			} else {
				this.log(`  - ${blockName} (missing block.json)`, "yellow");
			}
		});
	}

	/**
	 * Generate a complete block
	 */
	generateBlock(blockName, options) {
		this.validateBlockName(blockName);

		const blockDir = path.join(this.blocksPath, blockName);

		// Check if block already exists
		if (fs.existsSync(blockDir)) {
			this.error(`Block '${blockName}' already exists.`);
		}

		this.log(`🚀 Generating block: ${blockName}`, "cyan");

		// Ensure directories exist
		this.ensureDirectory(this.blocksPath);
		this.ensureDirectory(blockDir);

		// Generate files
		this.generateBlockJson(blockDir, blockName, options);
		this.generateTemplate(blockDir, blockName, options);
		this.generateStyles(blockDir, blockName);

		// Generate ACF fields if requested
		if (options.fields) {
			this.generateAcfFields(blockName, options);
		}

		this.success(`Block '${blockName}' generated successfully!`);
		this.info(`Location: ${blockDir}`);

		if (options.fields) {
			this.warning(
				"Don't forget to sync the ACF field group in the WordPress admin!"
			);
		}
	}
}

module.exports = { BlockGenerator };
