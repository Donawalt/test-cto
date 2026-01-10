import { z } from 'zod';

// Schema definitions
export const ColumnType = z.enum([
  'uuid',
  'string',
  'text',
  'integer',
  'float',
  'boolean',
  'date',
  'timestamp',
  'enum',
  'json',
  'array',
]);

export const RelationshipType = z.enum(['hasOne', 'hasMany', 'belongsTo', 'manyToMany']);

export const ColumnDefinitionSchema = z.object({
  name: z.string(),
  type: ColumnType,
  required: z.boolean().default(true),
  unique: z.boolean().default(false),
  primaryKey: z.boolean().default(false),
  default: z.union([z.string(), z.number(), z.boolean(), z.date()]).optional(),
  length: z.number().optional(),
  array: z.boolean().default(false),
  enumValues: z.array(z.string()).optional(),
});

export const RelationshipDefinitionSchema = z.object({
  type: RelationshipType,
  target: z.string(),
  foreignKey: z.string().optional(),
  through: z.string().optional(),
});

export const TableDefinitionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  columns: z.record(ColumnDefinitionSchema),
  relationships: z.record(RelationshipDefinitionSchema).optional(),
});

export type ColumnType = z.infer<typeof ColumnType>;
export type RelationshipType = z.infer<typeof RelationshipType>;
export type ColumnDefinition = z.infer<typeof ColumnDefinitionSchema>;
export type RelationshipDefinition = z.infer<typeof RelationshipDefinitionSchema>;
export type TableDefinition = z.infer<typeof TableDefinitionSchema>;

// Builder pattern for schema definition
export class ColumnBuilder {
  private column: Partial<ColumnDefinition>;

  constructor(type: ColumnType) {
    this.column = { type, name: '', required: true };
  }

  name(name: string): this {
    this.column.name = name;
    return this;
  }

  required(required = true): this {
    this.column.required = required;
    return this;
  }

  optional(): this {
    this.column.required = false;
    return this;
  }

  unique(unique = true): this {
    this.column.unique = unique;
    return this;
  }

  primaryKey(primaryKey = true): this {
    this.column.primaryKey = primaryKey;
    return this;
  }

  default(value: ColumnDefinition['default']): this {
    this.column.default = value;
    return this;
  }

  length(length: number): this {
    this.column.length = length;
    return this;
  }

  array(array = true): this {
    this.column.array = array;
    return this;
  }

  enum(values: string[]): this {
    this.column.enumValues = values;
    return this;
  }

  build(): ColumnDefinition {
    if (!this.column.name) {
      throw new Error('Column name is required');
    }
    return this.column as ColumnDefinition;
  }
}

export class RelationshipBuilder {
  private relationship: Partial<RelationshipDefinition>;

  constructor(type: RelationshipType, target: string) {
    this.relationship = { type, target };
  }

  foreignKey(key: string): this {
    this.relationship.foreignKey = key;
    return this;
  }

  through(table: string): this {
    this.relationship.through = table;
    return this;
  }

  build(): RelationshipDefinition {
    return this.relationship as RelationshipDefinition;
  }
}

// Main builder class
export class SchemaBuilder {
  private tables: Map<string, TableDefinition> = new Map();

  defineTable(table: TableDefinition): this {
    // Validate the table definition
    const validatedTable = TableDefinitionSchema.parse(table);

    // Validate that primary keys are marked as required
    Object.values(validatedTable.columns).forEach((column) => {
      if (column.primaryKey && !column.required) {
        throw new Error(`Primary key column "${column.name}" must be required`);
      }
    });

    this.tables.set(validatedTable.name, validatedTable);
    return this;
  }

  getTable(name: string): TableDefinition | undefined {
    return this.tables.get(name);
  }

  getAllTables(): Record<string, TableDefinition> {
    return Object.fromEntries(this.tables);
  }

  clear(): void {
    this.tables.clear();
  }

  // Generate TypeScript interfaces
  generateTypeScript(tables: Record<string, TableDefinition>): string {
    let output = `// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: pnpm types:generate

`;

    Object.values(tables).forEach((table) => {
      const interfaceName = this.toPascalCase(table.name);

      output += `export interface ${interfaceName} {\n`;

      Object.values(table.columns).forEach((column) => {
        const tsType = this.mapColumnToTypeScript(column);
        const optional = column.required ? '' : '?';
        const comment = `  /** ${column.type}${column.length ? `(${column.length})` : ''} */`;
        output += `${comment}\n  ${column.name}${optional}: ${tsType}\n`;
      });

      output += `}\n\n`;
    });

    return output;
  }

  // Generate Zod validators
  generateZodValidators(tables: Record<string, TableDefinition>): string {
    let output = `// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: pnpm types:generate

import { z } from 'zod'

`;

    Object.values(tables).forEach((table) => {
      const interfaceName = this.toPascalCase(table.name);

      output += `export const ${interfaceName}Schema = z.object({\n`;

      Object.values(table.columns).forEach((column) => {
        const zodType = this.mapColumnToZod(column);
        const optional = column.required ? '' : '.optional()';
        output += `  ${column.name}: ${zodType}${optional},\n`;
      });

      output += `})\n\n`;
      output += `export type ${interfaceName} = z.infer<typeof ${interfaceName}Schema>\n\n`;
    });

    return output;
  }

  // Generate API types
  generateAPI(tables: Record<string, TableDefinition>): string {
    const typeImports = Object.values(tables)
      .map((t) => this.toPascalCase(t.name))
      .join(', ');
    let output = `// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: pnpm types:generate

import type { ${typeImports} } from './types'

`;

    Object.values(tables).forEach((table) => {
      const interfaceName = this.toPascalCase(table.name);
      const endpoint = `/${table.name}`;

      output += `export namespace ${interfaceName}API {\n`;
      output += `  export const ENDPOINT = '${endpoint}'\n\n`;

      // Create body
      const createColumns = Object.values(table.columns).filter(
        (col) => !col.primaryKey && !col.name.includes('created') && !col.name.includes('updated')
      );

      if (createColumns.length > 0) {
        output += `  export interface CreateBody {\n`;
        createColumns.forEach((column) => {
          const tsType = this.mapColumnToTypeScript(column);
          const optional = column.required ? '' : '?';
          output += `    ${column.name}${optional}: ${tsType}\n`;
        });
        output += `  }\n\n`;
      }

      // Update body (all fields optional except id and timestamps)
      output += `  export interface UpdateBody {\n`;
      Object.values(table.columns).forEach((column) => {
        if (!column.name.includes('created')) {
          const tsType = this.mapColumnToTypeScript(column);
          output += `    ${column.name}?: ${tsType}\n`;
        }
      });
      output += `  }\n\n`;

      // Response type
      output += `  export interface Response extends ${interfaceName} {}\n\n`;

      output += `}\n\n`;
    });

    return output;
  }

  // Generate Drizzle schemas
  generateDrizzleSchemas(tables: Record<string, TableDefinition>): string {
    let output = `// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: pnpm types:generate

import { pgTable, ${this.getDrizzleImports(tables)} } from 'drizzle-orm/pg-core'

`;

    Object.values(tables).forEach((table) => {
      const tableName = this.toPascalCase(table.name) + 'Table';
      const tableVarName = this.toCamelCase(table.name) + 'Table';

      output += `export const ${tableVarName} = pgTable('${table.name}', {\n`;

      Object.values(table.columns).forEach((column) => {
        const drizzleDef = this.mapColumnToDrizzle(column);
        output += `  ${column.name}: ${drizzleDef},\n`;
      });

      output += `})\n\n`;
      output += `export type ${this.toPascalCase(table.name)} = typeof ${tableVarName}.$inferSelect\n`;
      output += `export type Create${this.toPascalCase(table.name)} = typeof ${tableVarName}.$inferInsert\n\n`;
    });

    return output;
  }

  // Generate mock data
  generateMockData(tables: Record<string, TableDefinition>): string {
    const typeImports = Object.values(tables)
      .map((t) => this.toPascalCase(t.name))
      .join(', ');
    let output = `// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Run: pnpm types:generate

import type { ${typeImports} } from './types'

function __uuid__(): string {
  const g: any = globalThis as any
  if (g.crypto && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID()
  }
  const s: string[] = []
  const hex = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  for (let i = 0; i < hex.length; i++) {
    const c = hex[i]
    if (c === 'x' || c === 'y') {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      s.push(v.toString(16))
    } else {
      s.push(c)
    }
  }
  return s.join('')
}

`;

    Object.values(tables).forEach((table) => {
      const interfaceName = this.toPascalCase(table.name);

      output += `export function createMock${interfaceName}(overrides?: Partial<${interfaceName}>): ${interfaceName} {\n`;
      output += `  return {\n`;

      const columns = Object.values(table.columns);
      columns.forEach((column, index) => {
        const mockValue = this.generateMockValue(column);
        output += `    ${column.name}: ${mockValue}`;
        output += `,`;
        output += `\n`;
      });

      output += `    ...overrides,\n`;
      output += `  }\n`;
      output += `}\n\n`;
    });

    return output;
  }

  private mapColumnToTypeScript(column: ColumnDefinition): string {
    switch (column.type) {
      case 'uuid':
        return 'string';
      case 'string':
        return 'string';
      case 'text':
        return 'string';
      case 'integer':
        return 'number';
      case 'float':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'date':
      case 'timestamp':
        return 'Date';
      case 'enum':
        if (column.enumValues) {
          return column.enumValues.map((v) => `'${v}'`).join(' | ');
        }
        return 'string';
      case 'json':
        return 'any';
      case 'array':
        return 'any[]';
      default:
        return 'any';
    }
  }

  private mapColumnToZod(column: ColumnDefinition): string {
    switch (column.type) {
      case 'uuid':
        return 'z.string().uuid()';
      case 'string':
        return `z.string()${column.length ? `.max(${column.length})` : ''}`;
      case 'text':
        return 'z.string()';
      case 'integer':
        return 'z.number().int()';
      case 'float':
        return 'z.number()';
      case 'boolean':
        return 'z.boolean()';
      case 'date':
      case 'timestamp':
        return 'z.date()';
      case 'enum':
        if (column.enumValues) {
          return `z.enum([${column.enumValues.map((v) => `'${v}'`).join(', ')}])`;
        }
        return 'z.string()';
      case 'json':
        return 'z.any()';
      case 'array':
        return 'z.array(z.any())';
      default:
        return 'z.any()';
    }
  }

  private mapColumnToDrizzle(column: ColumnDefinition): string {
    let base = '';
    switch (column.type) {
      case 'uuid':
        base = `uuid('${column.name}')`;
        break;
      case 'string':
        base = `varchar('${column.name}', { length: ${column.length || 255} })`;
        break;
      case 'text':
        base = `text('${column.name}')`;
        break;
      case 'integer':
        base = `integer('${column.name}')`;
        break;
      case 'float':
        base = `numeric('${column.name}')`;
        break;
      case 'boolean':
        base = `boolean('${column.name}')`;
        break;
      case 'date':
        base = `date('${column.name}')`;
        break;
      case 'timestamp':
        base = `timestamp('${column.name}')`;
        break;
      case 'enum':
        base = `varchar('${column.name}', { length: ${column.length || 50} })`;
        break;
      case 'json':
        base = `jsonb('${column.name}')`;
        break;
      case 'array':
        base = `jsonb('${column.name}')`;
        break;
      default:
        base = `text('${column.name}')`;
    }

    const chains: string[] = [];
    if (column.primaryKey) chains.push('primaryKey()');
    if (column.required) chains.push('notNull()');
    if (column.default !== undefined && column.default !== null) {
      if (typeof column.default === 'string' && column.default.includes('uuid()')) {
        chains.push('defaultRandom()');
      } else if (typeof column.default === 'string' && column.default.includes('now()')) {
        chains.push('defaultNow()');
      } else if (typeof column.default === 'boolean' && column.type === 'boolean') {
        chains.push(`default(${column.default})`);
      } else if (
        typeof column.default === 'number' &&
        (column.type === 'integer' || column.type === 'float')
      ) {
        chains.push(`default(${column.default})`);
      } else if (typeof column.default === 'string') {
        chains.push(`default('${column.default}')`);
      }
    }

    return chains.length ? `${base}.${chains.join('.')}` : base;
  }

  private getDrizzleImports(tables: Record<string, TableDefinition>): string {
    const imports = new Set<string>();

    Object.values(tables).forEach((table) => {
      Object.values(table.columns).forEach((column) => {
        if (column.type === 'uuid') imports.add('uuid');
        if (column.type === 'string') imports.add('varchar');
        if (column.type === 'text') imports.add('text');
        if (column.type === 'integer') imports.add('integer');
        if (column.type === 'float') imports.add('numeric');
        if (column.type === 'boolean') imports.add('boolean');
        if (column.type === 'date') imports.add('date');
        if (column.type === 'timestamp') imports.add('timestamp');
        if (column.type === 'json' || column.type === 'array') imports.add('jsonb');
      });
    });

    return Array.from(imports).join(', ');
  }

  private generateMockValue(column: ColumnDefinition): string {
    switch (column.type) {
      case 'uuid':
        return '__uuid__()';
      case 'string':
        if (column.enumValues) {
          return `'${column.enumValues[0] || 'default'}'`;
        }
        return `'mock-${column.name}'`;
      case 'text':
        return `'Mock ${column.name} content'`;
      case 'integer':
        return '42';
      case 'float':
        return '3.14';
      case 'boolean':
        return 'true';
      case 'date':
      case 'timestamp':
        return 'new Date()';
      case 'enum':
        if (column.enumValues) {
          return `'${column.enumValues[0] || 'default'}'`;
        }
        return `'default'`;
      case 'json':
        return '{}';
      case 'array':
        return '[]';
      default:
        return 'null';
    }
  }

  private toPascalCase(str: string): string {
    return str.replace(/(^\w|_\w)/g, (match) => match.replace('_', '').toUpperCase());
  }

  private toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}

// Convenience functions for schema definition
export function defineTable(table: z.input<typeof TableDefinitionSchema>): TableDefinition {
  return TableDefinitionSchema.parse(table);
}

export function column(type: ColumnType): ColumnBuilder {
  return new ColumnBuilder(type);
}

export function relationship(type: RelationshipType, target: string): RelationshipBuilder {
  return new RelationshipBuilder(type, target);
}

// Export singleton instance
export const schemaBuilder = new SchemaBuilder();
