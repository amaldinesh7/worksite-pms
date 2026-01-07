#!/usr/bin/env npx tsx

/**
 * Documentation Generator
 *
 * Scans the codebase and generates markdown documentation for AI context.
 * Run with: pnpm docs:generate
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// SERVICES.md Generator
function generateServicesDoc(): void {
  console.log('📦 Generating SERVICES.md...');
  const registryPath = path.join(ROOT_DIR, 'apps/api/src/services/registry.ts');

  if (!fs.existsSync(registryPath)) {
    fs.writeFileSync(path.join(DOCS_DIR, 'SERVICES.md'), '# External Services\n\nNo services configured yet.\n');
    return;
  }

  const content = fs.readFileSync(registryPath, 'utf-8');
  let markdown = `# External Services\n\n> Auto-generated from \`apps/api/src/services/registry.ts\`\n> Last generated: ${new Date().toISOString()}\n\n---\n\n`;

  const serviceBlocks = content.match(/(\w+):\s*\{[^}]+\}/g) || [];
  
  for (const block of serviceBlocks) {
    const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
    const purposeMatch = block.match(/purpose:\s*['"]([^'"]+)['"]/);
    const statusMatch = block.match(/status:\s*['"]([^'"]+)['"]/);
    const docsUrlMatch = block.match(/docsUrl:\s*['"]([^'"]+)['"]/);

    if (nameMatch) {
      markdown += `### ${nameMatch[1]}\n`;
      if (purposeMatch) markdown += `- **Purpose**: ${purposeMatch[1]}\n`;
      if (statusMatch) markdown += `- **Status**: \`${statusMatch[1]}\`\n`;
      if (docsUrlMatch) markdown += `- **Docs**: ${docsUrlMatch[1]}\n`;
      markdown += '\n';
    }
  }

  fs.writeFileSync(path.join(DOCS_DIR, 'SERVICES.md'), markdown);
  console.log('  ✅ SERVICES.md generated');
}

// DATABASE.md Generator
function generateDatabaseDoc(): void {
  console.log('🗄️  Generating DATABASE.md...');
  const schemaPath = path.join(ROOT_DIR, 'apps/api/prisma/schema.prisma');

  if (!fs.existsSync(schemaPath)) {
    fs.writeFileSync(path.join(DOCS_DIR, 'DATABASE.md'), '# Database Schema\n\nNo schema found.\n');
    return;
  }

  const content = fs.readFileSync(schemaPath, 'utf-8');
  let markdown = `# Database Schema\n\n> Auto-generated from \`apps/api/prisma/schema.prisma\`\n> Last generated: ${new Date().toISOString()}\n\n---\n\n`;

  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  let match;

  while ((match = modelRegex.exec(content)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];

    markdown += `### ${modelName}\n\n| Field | Type | Attributes |\n|-------|------|------------|\n`;

    const lines = modelBody.split('\n').filter((line) => line.trim() && !line.trim().startsWith('@@'));
    for (const line of lines) {
      const fieldMatch = line.trim().match(/^(\w+)\s+(\S+)(.*)$/);
      if (fieldMatch) {
        markdown += `| \`${fieldMatch[1]}\` | \`${fieldMatch[2]}\` | ${fieldMatch[3].trim() || '-'} |\n`;
      }
    }
    markdown += '\n';
  }

  fs.writeFileSync(path.join(DOCS_DIR, 'DATABASE.md'), markdown);
  console.log('  ✅ DATABASE.md generated');
}

// API.md Generator
function generateApiDoc(): void {
  console.log('🔌 Generating API.md...');
  const apiIndexPath = path.join(ROOT_DIR, 'apps/api/src/index.ts');

  let markdown = `# API Reference\n\n> Auto-generated\n> Last generated: ${new Date().toISOString()}\n\n---\n\n## Base URL\n\n- **Development**: \`http://localhost:3000\`\n\n## Endpoints\n\n`;

  if (fs.existsSync(apiIndexPath)) {
    const content = fs.readFileSync(apiIndexPath, 'utf-8');
    const routeRegex = /fastify\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/gi;
    let routeMatch;

    markdown += '| Method | Endpoint |\n|--------|----------|\n';
    while ((routeMatch = routeRegex.exec(content)) !== null) {
      markdown += `| \`${routeMatch[1].toUpperCase()}\` | \`${routeMatch[2]}\` |\n`;
    }
  }

  fs.writeFileSync(path.join(DOCS_DIR, 'API.md'), markdown);
  console.log('  ✅ API.md generated');
}

// COMPONENTS.md Generator
function generateComponentsDoc(): void {
  console.log('🧩 Generating COMPONENTS.md...');
  const uiIndexPath = path.join(ROOT_DIR, 'packages/ui/src/index.ts');

  let markdown = `# UI Components\n\n> Auto-generated from \`packages/ui/src/index.ts\`\n> Last generated: ${new Date().toISOString()}\n\n---\n\n## Usage\n\n\`\`\`typescript\nimport { YStack, Text, Button } from '@worksite/ui';\n\`\`\`\n\n## Available Components\n\n`;

  if (fs.existsSync(uiIndexPath)) {
    const content = fs.readFileSync(uiIndexPath, 'utf-8');
    const exportRegex = /export\s*\{([^}]+)\}/g;
    let exportMatch;

    while ((exportMatch = exportRegex.exec(content)) !== null) {
      const exports = exportMatch[1].split(',').map((e) => e.trim().split(' ')[0]).filter(Boolean);
      for (const exp of exports) {
        markdown += `- \`${exp}\`\n`;
      }
    }
  }

  fs.writeFileSync(path.join(DOCS_DIR, 'COMPONENTS.md'), markdown);
  console.log('  ✅ COMPONENTS.md generated');
}

// Main
async function main(): Promise<void> {
  console.log('\n🚀 Generating documentation...\n');
  generateServicesDoc();
  generateDatabaseDoc();
  generateApiDoc();
  generateComponentsDoc();
  console.log('\n✨ Documentation generated in docs/\n');
}

main().catch(console.error);
