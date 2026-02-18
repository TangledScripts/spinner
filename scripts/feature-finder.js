#!/usr/bin/env node
/**
 * Feature Finder — search and browse the feature registry
 *
 * Usage:
 *   node scripts/feature-finder.js --list              List all features
 *   node scripts/feature-finder.js --search <term>     Search by keyword
 *   node scripts/feature-finder.js --category <cat>    Filter by category
 *   node scripts/feature-finder.js --day <n>           Filter by day added
 *   node scripts/feature-finder.js --detail <name>     Show full details
 *   node scripts/feature-finder.js --categories        List all categories
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = join(import.meta.dirname, '..');
const registryPath = join(PROJECT_ROOT, 'features.json');

let registry;
try {
  registry = JSON.parse(readFileSync(registryPath, 'utf8'));
} catch {
  console.error('No features.json found. Run: npm run register');
  process.exit(1);
}

const args = process.argv.slice(2);
const flag = args[0];
const value = args.slice(1).join(' ');

function printFeature(name, f, detail = false) {
  const day = f.day ? `Day ${f.day}` : '?';
  const cat = f.category || 'uncategorized';
  console.log(`  ${name} [${day}] (${cat})`);
  if (detail) {
    console.log(`    ${f.description}`);
    console.log(`    Files: ${f.files.join(', ')}`);
    if (f.locations) {
      console.log(`    Locations:`);
      for (const loc of f.locations) {
        console.log(`      ${loc.file}:${loc.line} (${loc.aspect})`);
      }
    }
    console.log('');
  }
}

switch (flag) {
  case '--list': {
    console.log(`\n${registry.featureCount} features:\n`);
    for (const [name, f] of Object.entries(registry.features)) {
      printFeature(name, f);
    }
    break;
  }

  case '--search': {
    if (!value) { console.error('Usage: --search <term>'); break; }
    const term = value.toLowerCase();
    const matches = Object.entries(registry.features).filter(([name, f]) =>
      name.includes(term) ||
      (f.description || '').toLowerCase().includes(term) ||
      (f.category || '').toLowerCase().includes(term) ||
      (f.files || []).some(file => file.toLowerCase().includes(term))
    );
    console.log(`\n${matches.length} matches for "${value}":\n`);
    for (const [name, f] of matches) {
      printFeature(name, f, true);
    }
    break;
  }

  case '--category': {
    if (!value) { console.error('Usage: --category <cat>'); break; }
    const catFeatures = registry.categories[value] || [];
    if (!catFeatures.length) {
      // Try partial match
      const partial = Object.entries(registry.categories)
        .filter(([cat]) => cat.includes(value));
      if (partial.length) {
        for (const [cat, names] of partial) {
          console.log(`\n${cat}:`);
          for (const name of names) {
            printFeature(name, registry.features[name]);
          }
        }
      } else {
        console.log(`No features in category "${value}"`);
      }
    } else {
      console.log(`\n${value} (${catFeatures.length} features):\n`);
      for (const name of catFeatures) {
        printFeature(name, registry.features[name], true);
      }
    }
    break;
  }

  case '--day': {
    const dayNum = parseInt(value);
    const matches = Object.entries(registry.features)
      .filter(([, f]) => f.day === dayNum);
    console.log(`\nDay ${dayNum} features (${matches.length}):\n`);
    for (const [name, f] of matches) {
      printFeature(name, f, true);
    }
    break;
  }

  case '--detail': {
    if (!value) { console.error('Usage: --detail <feature-name>'); break; }
    const f = registry.features[value];
    if (!f) {
      console.log(`Feature "${value}" not found`);
    } else {
      console.log('');
      printFeature(value, f, true);
    }
    break;
  }

  case '--categories': {
    console.log(`\nCategories:\n`);
    for (const [cat, names] of Object.entries(registry.categories)) {
      console.log(`  ${cat} (${names.length}): ${names.join(', ')}`);
    }
    break;
  }

  default:
    console.log('Feature Finder — search the feature registry');
    console.log('');
    console.log('Usage:');
    console.log('  npm run features:list              List all features');
    console.log('  npm run features:search <term>     Search by keyword');
    console.log('  npm run features:category <cat>    Filter by category');
    console.log('  npm run features:day <n>           Filter by day added');
    console.log('  npm run features:detail <name>     Full feature details');
    console.log('  npm run features:categories        List all categories');
}
