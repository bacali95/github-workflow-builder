import { JSONSchema7Definition } from 'json-schema';
import { resolveSchema } from './resolveSchema';

export function resolveIndexSchema(
  index: number,
  schema: JSONSchema7Definition | undefined,
  definitions: Record<string, JSONSchema7Definition>
): JSONSchema7Definition | undefined {
  schema = resolveSchema(schema, definitions);

  if (typeof schema === 'boolean' || !schema) return schema;

  if (schema.items instanceof Array) {
    if (index < schema.items.length) {
      return schema.items[index];
    } else {
      return schema.additionalItems;
    }
  }

  return schema.items;
}
