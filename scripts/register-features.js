#!/usr/bin/env node
/**
 * Feature Registry Generator
 * Scans source files for @feature annotations and builds features.json
 *
 * Usage: node scripts/register-features.js
 *
 * Annotation format (JS):
 *   /** @feature feature-name
 *    *  @day N @date YYYY-MM-DD
 *    *  @category category/subcategory
 *    *  @desc Description of what this does and how to reuse it.
 *    *  @files file1.js, file2.css
 *    *\/
 *
 * Annotation format (CSS):
 *   /** @feature feature-name
 *    *  Same tags as JS
 *    *\/
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';

const PROJECT_ROOT = join(import.meta.dirname, '..');
const SRC_DIRS = ['src', '.'];
const EXTENSIONS = ['.js', '.css', '.html'];
const EXCLUDE = ['node_modules', 'dist', '.claude', '.rag', '.planning', 'scripts', 'tests', 'docs'];

function collectFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (EXCLUDE.includes(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collectFiles(full, files);
    } else if (EXTENSIONS.includes(extname(entry))) {
      files.push(full);
    }
  }
  return files;
}

function parseFeatureBlocks(content, filePath) {
  const blocks = [];
  // Match /** @feature ... */ blocks (both JS and CSS style)
  const regex = /\/\*\*\s*@feature\s+([\s\S]*?)\*\//g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const block = match[1];
    const feature = {};

    // Extract feature name (first thing in the captured block, before any newline or @tag)
    const nameMatch = block.match(/^([^\n@*]+)/);
    if (nameMatch) {
      // Feature name may include "— description suffix", split on that
      const parts = nameMatch[1].trim().split(/\s*[—–]\s*/);
      feature.name = parts[0].trim();
      if (parts[1]) feature.aspect = parts[1].trim();
    }

    // Extract tags
    const dayMatch = block.match(/@day\s+(\d+)/);
    if (dayMatch) feature.day = parseInt(dayMatch[1]);

    const dateMatch = block.match(/@date\s+([\d-]+)/);
    if (dateMatch) feature.date = dateMatch[1];

    const catMatch = block.match(/@category\s+([^\n*@]+)/);
    if (catMatch) feature.category = catMatch[1].trim();

    const descMatch = block.match(/@desc\s+([^\n]*(?:\n\s*\*\s+[^@][^\n]*)*)/);
    if (descMatch) {
      feature.description = descMatch[1]
        .replace(/\n\s*\*\s*/g, ' ')
        .trim();
    }

    const filesMatch = block.match(/@files\s+([^\n*@]+)/);
    if (filesMatch) {
      feature.declaredFiles = filesMatch[1].trim().split(/,\s*/);
    }

    feature.sourceFile = relative(PROJECT_ROOT, filePath);

    // Get line number
    const beforeMatch = content.substring(0, match.index);
    feature.line = (beforeMatch.match(/\n/g) || []).length + 1;

    blocks.push(feature);
  }

  return blocks;
}

function buildRegistry(blocks) {
  const features = {};
  const categories = {};

  for (const block of blocks) {
    const name = block.name;
    if (!name) continue;

    if (!features[name]) {
      features[name] = {
        name,
        day: block.day || null,
        date: block.date || null,
        category: block.category || null,
        description: block.description || '',
        files: block.declaredFiles || [],
        locations: [],
      };
    }

    // Merge: fill in missing metadata from later blocks
    if (!features[name].day && block.day) features[name].day = block.day;
    if (!features[name].date && block.date) features[name].date = block.date;
    if ((!features[name].category || features[name].category === 'uncategorized') && block.category) {
      features[name].category = block.category;
    }
    if (!features[name].description && block.description) {
      features[name].description = block.description;
    }
    features[name].locations.push({
      file: block.sourceFile,
      line: block.line,
      aspect: block.aspect || 'primary',
    });

    // Update files list with actual source files
    if (!features[name].files.includes(block.sourceFile)) {
      // Don't duplicate if already declared
      const basename = block.sourceFile.split('/').pop();
      if (!features[name].files.includes(basename)) {
        features[name].files.push(block.sourceFile);
      }
    }

    // Build category index
    const cat = features[name].category || 'uncategorized';
    if (!categories[cat]) categories[cat] = [];
    if (!categories[cat].includes(name)) {
      categories[cat].push(name);
    }
  }

  // Rebuild category index with final resolved categories
  const cleanCategories = {};
  for (const [name, f] of Object.entries(features)) {
    const cat = f.category || 'uncategorized';
    f.category = cat;
    if (!cleanCategories[cat]) cleanCategories[cat] = [];
    if (!cleanCategories[cat].includes(name)) cleanCategories[cat].push(name);
  }

  return {
    version: '1.0.0',
    generated: new Date().toISOString().split('T')[0],
    featureCount: Object.keys(features).length,
    locationCount: blocks.length,
    features,
    categories: cleanCategories,
  };
}

// Run
const files = collectFiles(PROJECT_ROOT);
const allBlocks = [];

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const blocks = parseFeatureBlocks(content, file);
  allBlocks.push(...blocks);
}

const registry = buildRegistry(allBlocks);
const outPath = join(PROJECT_ROOT, 'features.json');
writeFileSync(outPath, JSON.stringify(registry, null, 2));

console.log(`Registered ${registry.featureCount} features (${registry.locationCount} annotations across ${files.length} files)`);
console.log(`Categories: ${Object.keys(registry.categories).join(', ')}`);
console.log(`Written to: features.json`);
