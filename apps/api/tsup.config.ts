import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  splitting: false,
  // Don't bundle dependencies - they're installed in node_modules
  external: [
    '@fastify/cookie',
    '@fastify/cors',
    '@fastify/jwt',
    '@fastify/multipart',
    '@prisma/client',
    '@supabase/supabase-js',
    'adm-zip',
    'bcrypt',
    'dotenv',
    'fastify',
    'fastify-type-provider-zod',
    'file-type',
    'openai',
    'exceljs',
    'pdf-lib',
    'pdf-parse',
    'sharp',
    'zod',
  ],
  // Handle __dirname and __filename for ESM
  shims: true,
});
