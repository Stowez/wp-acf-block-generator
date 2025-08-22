#!/usr/bin/env node

/**
 * WordPress ACF Block Generator CLI
 *
 * @author stowez
 * @version 1.0.0
 */

const { BlockGenerator } = require("../lib/index.js");

const generator = new BlockGenerator();
generator.run();
