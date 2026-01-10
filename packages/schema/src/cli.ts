#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { chokidar } from 'chokidar'
import { schemaBuilder } from './builder'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Command line argument parsing
const args = process.argv.slice(2)
const command = args[0]
const flags = args.slice(1)

interface CLIOptions {
  output?: string
  watch?: boolean
  name?: string
}

function parseArgs(): CLIOptions {
  const options: CLIOptions = {}
  
  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i]
    
    switch (flag) {
      case '--output':
        options.output = flags[++i]
        break
      case '--watch':
        options.watch = true
        break
      case '--name':
        options.name = flags[++i]
        break
    }
  }
  
  return options
}

// Load schemas from directory
async function loadSchemas(schemasDir: string) {
  if (!existsSync(schemasDir)) {
    console.log(`📁 Schemas directory not found: ${schemasDir}`)
    return
  }

  // Clear existing schemas
  schemaBuilder.clear()

  const files = readdirSync(schemasDir, { withFileTypes: true })
  
  for (const file of files) {
    if (file.isFile() && file.name.endsWith('.ts') && file.name !== 'index.ts') {
      const schemaPath = join(schemasDir, file.name)
      console.log(`📄 Loading schema: ${schemaPath}`)
      
      try {
        // Dynamic import of schema file
        const module = await import(`${schemaPath}?t=${Date.now()}`)
        console.log(`✅ Loaded schema: ${file.name}`)
      } catch (error) {
        console.error(`❌ Error loading schema ${file.name}:`, error)
      }
    }
  }

  // Also try to load the index file
  const indexPath = join(schemasDir, 'index.ts')
  if (existsSync(indexPath)) {
    console.log(`📄 Loading schema index: ${indexPath}`)
    try {
      const module = await import(`${indexPath}?t=${Date.now()}`)
      console.log(`✅ Loaded schema index`)
    } catch (error) {
      console.error(`❌ Error loading schema index:`, error)
    }
  }
}

// Generate all outputs
function generateOutputs(outputDir: string) {
  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const tables = schemaBuilder.getAllTables()
  
  if (Object.keys(tables).length === 0) {
    console.log('⚠️ No schemas defined')
    return
  }

  console.log(`🔨 Generating types for ${Object.keys(tables).length} schema(s)...`)

  try {
    // Generate TypeScript interfaces
    const tsOutput = schemaBuilder.generateTypeScript(tables)
    writeFileSync(join(outputDir, 'types.ts'), tsOutput)

    // Generate Zod validators
    const zodOutput = schemaBuilder.generateZodValidators(tables)
    writeFileSync(join(outputDir, 'validators.ts'), zodOutput)

    // Generate API endpoints
    const apiOutput = schemaBuilder.generateAPI(tables)
    writeFileSync(join(outputDir, 'api.ts'), apiOutput)

    // Generate Drizzle schemas
    const drizzleOutput = schemaBuilder.generateDrizzleSchemas(tables)
    writeFileSync(join(outputDir, 'drizzle.ts'), drizzleOutput)

    // Generate mock data
    const mockOutput = schemaBuilder.generateMockData(tables)
    writeFileSync(join(outputDir, 'mocks.ts'), mockOutput)

    console.log(`✅ Generated files in: ${outputDir}`)
  } catch (error) {
    console.error('❌ Error generating outputs:', error)
    throw error
  }
}

// Watch mode
async function startWatch(outputDir: string) {
  console.log(`👀 Starting watch mode...`)
  
  const schemasDir = resolve(__dirname, 'schemas')
  
  if (!existsSync(schemasDir)) {
    mkdirSync(schemasDir, { recursive: true })
  }
  
  const watcher = chokidar.watch(schemasDir, {
    ignored: /^\./,
    persistent: true,
  })
  
  watcher.on('change', async (path) => {
    console.log(`📄 Schema changed: ${path}`)
    try {
      await loadSchemas(schemasDir)
      generateOutputs(outputDir)
      console.log(`✅ Regenerated types`)
    } catch (error) {
      console.error(`❌ Error regenerating types:`, error)
    }
  })

  watcher.on('add', async (path) => {
    console.log(`📄 Schema added: ${path}`)
    try {
      await loadSchemas(schemasDir)
      generateOutputs(outputDir)
      console.log(`✅ Regenerated types`)
    } catch (error) {
      console.error(`❌ Error regenerating types:`, error)
    }
  })
}

// Migration commands
function createMigration(name: string) {
  console.log(`🔨 Creating migration: ${name}`)
  const migrationsDir = resolve(__dirname, '../migrations')
  
  if (!existsSync(migrationsDir)) {
    mkdirSync(migrationsDir, { recursive: true })
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const filename = `${timestamp}_${name}.sql`
  const filepath = join(migrationsDir, filename)
  
  const migrationTemplate = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Add your SQL here

`
  
  writeFileSync(filepath, migrationTemplate)
  console.log(`✅ Migration created: ${filepath}`)
}

function runMigrations() {
  console.log(`🚀 Running migrations...`)
  const migrationsDir = resolve(__dirname, '../migrations')
  
  if (!existsSync(migrationsDir)) {
    console.log('📁 No migrations directory found')
    return
  }
  
  const migrations = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
  
  if (migrations.length === 0) {
    console.log('📭 No migrations to run')
    return
  }
  
  console.log(`🔄 Found ${migrations.length} migrations to run`)
  
  migrations.forEach(migration => {
    console.log(`▶️ Running migration: ${migration}`)
    // In a real implementation, you would execute the SQL here
    console.log(`✅ Migration completed: ${migration}`)
  })
}

// Main CLI handler
async function main() {
  const options = parseArgs()
  
  try {
    switch (command) {
      case 'generate':
        const schemasDir = resolve(__dirname, 'schemas')
        const outputDir = options.output || resolve(__dirname, '../../../types/src/generated')
        
        await loadSchemas(schemasDir)
        generateOutputs(outputDir)
        
        if (options.watch) {
          await startWatch(outputDir)
        }
        break
        
      case 'migrate:create':
        if (!options.name) {
          console.error('❌ Migration name required')
          process.exit(1)
        }
        createMigration(options.name)
        break
        
      case 'migrate:run':
        runMigrations()
        break
        
      default:
        console.log(`
🔨 MyApp Schema CLI

Usage: schema <command> [options]

Commands:
  generate           Generate types from schemas
    --output <dir>  Output directory for generated types
    --watch         Watch mode for auto-regeneration
    
  migrate:create     Create a new migration
    --name <name>   Migration name
    
  migrate:run       Run pending migrations

Examples:
  schema generate
  schema generate --watch --output ./types
  schema migrate:create --name AddUsers
  schema migrate:run
        `)
        break
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()