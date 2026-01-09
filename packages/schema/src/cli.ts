#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { schemaBuilder } from './index';

const command = process.argv[2];

if (command === 'generate') {
  console.log('🔨 Generating schemas...');

  schemaBuilder.define({
    name: 'User',
    description: 'User entity',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'User ID' },
      { name: 'email', type: 'string', required: true, description: 'User email' },
      { name: 'name', type: 'string', required: true, description: 'User name' },
      { name: 'createdAt', type: 'date', required: true, description: 'Creation date' },
    ],
  });

  schemaBuilder.define({
    name: 'Post',
    description: 'Post entity',
    fields: [
      { name: 'id', type: 'string', required: true, description: 'Post ID' },
      { name: 'title', type: 'string', required: true, description: 'Post title' },
      { name: 'content', type: 'string', required: true, description: 'Post content' },
      { name: 'authorId', type: 'string', required: true, description: 'Author ID' },
      { name: 'published', type: 'boolean', required: true, description: 'Published status' },
      { name: 'createdAt', type: 'date', required: true, description: 'Creation date' },
    ],
  });

  const schemas = schemaBuilder.getAll();
  let output = "import { z } from 'zod';\n\n";

  schemas.forEach((schema) => {
    const zodSchema = schemaBuilder.generateZodSchema(schema.name);
    const tsInterface = schemaBuilder.generateTypeScriptInterface(schema.name);
    
    if (zodSchema && tsInterface) {
      output += `${zodSchema}\n\n`;
      output += `${tsInterface}\n\n`;
    }
  });

  const outputPath = resolve(process.cwd(), 'generated-schemas.ts');
  writeFileSync(outputPath, output);

  console.log(`✅ Schemas generated at: ${outputPath}`);
} else {
  console.log('Usage: schema generate');
}
