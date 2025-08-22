#!/usr/bin/env node

/**
 * Simple test to verify the package works
 */

const { BlockGenerator } = require('./lib/index.js');

console.log('🧪 Testing wp-acf-block-generator...');

// Test instantiation
try {
    const generator = new BlockGenerator();
    console.log('✅ BlockGenerator class instantiated successfully');
} catch (error) {
    console.error('❌ Error instantiating BlockGenerator:', error.message);
    process.exit(1);
}

// Test with custom config
try {
    const generator = new BlockGenerator({
        defaultCategory: 'test-blocks',
        blocksDir: 'test-blocks'
    });
    console.log('✅ BlockGenerator with custom config works');
} catch (error) {
    console.error('❌ Error with custom config:', error.message);
    process.exit(1);
}

console.log('🎉 All tests passed!');
console.log('');
console.log('To test interactively, run:');
console.log('  npm test -- --interactive');
console.log('  npm test -- --help');
