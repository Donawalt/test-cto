import { z } from 'zod';

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  required?: boolean;
  description?: string;
  validation?: z.ZodSchema;
}

export interface SchemaDefinition {
  name: string;
  fields: SchemaField[];
  description?: string;
}

export class SchemaBuilder {
  private schemas: Map<string, SchemaDefinition> = new Map();

  define(schema: SchemaDefinition): this {
    this.schemas.set(schema.name, schema);
    return this;
  }

  get(name: string): SchemaDefinition | undefined {
    return this.schemas.get(name);
  }

  getAll(): SchemaDefinition[] {
    return Array.from(this.schemas.values());
  }

  generateZodSchema(name: string): string | null {
    const schema = this.schemas.get(name);
    if (!schema) return null;

    const fields = schema.fields.map((field) => {
      let zodType = '';
      
      switch (field.type) {
        case 'string':
          zodType = 'z.string()';
          break;
        case 'number':
          zodType = 'z.number()';
          break;
        case 'boolean':
          zodType = 'z.boolean()';
          break;
        case 'date':
          zodType = 'z.date()';
          break;
        case 'object':
          zodType = 'z.object({})';
          break;
        case 'array':
          zodType = 'z.array(z.unknown())';
          break;
      }

      if (!field.required) {
        zodType += '.optional()';
      }

      return `  ${field.name}: ${zodType},`;
    }).join('\n');

    return `export const ${schema.name}Schema = z.object({\n${fields}\n});`;
  }

  generateTypeScriptInterface(name: string): string | null {
    const schema = this.schemas.get(name);
    if (!schema) return null;

    const fields = schema.fields.map((field) => {
      let tsType = '';
      
      switch (field.type) {
        case 'string':
          tsType = 'string';
          break;
        case 'number':
          tsType = 'number';
          break;
        case 'boolean':
          tsType = 'boolean';
          break;
        case 'date':
          tsType = 'Date';
          break;
        case 'object':
          tsType = 'object';
          break;
        case 'array':
          tsType = 'unknown[]';
          break;
      }

      const optional = field.required ? '' : '?';
      const description = field.description ? `\n  /** ${field.description} */` : '';

      return `${description}\n  ${field.name}${optional}: ${tsType};`;
    }).join('\n');

    return `export interface ${schema.name} {\n${fields}\n}`;
  }
}

export const schemaBuilder = new SchemaBuilder();
