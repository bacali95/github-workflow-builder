import {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7TypeName,
} from 'json-schema';
import { resolveSchema } from './resolveSchema';

export function resolvePropertySchema(
  propertyName: string,
  type: JSONSchema7TypeName,
  schema: JSONSchema7Definition | undefined,
  definitions: Record<string, JSONSchema7Definition>
): JSONSchema7Definition | undefined {
  schema = resolveSchema(schema, definitions);

  if (typeof schema === 'boolean' || !schema) return schema;

  if (schema.properties?.[propertyName]) {
    return resolveSchemaByType(type, schema.properties[propertyName]);
  }

  for (const pattern of Object.keys(schema.patternProperties ?? {})) {
    if (new RegExp(pattern).test(propertyName)) {
      return resolveSchemaByType(type, schema.patternProperties?.[pattern]);
    }
  }

  return resolveSchemaByType(type, schema.additionalProperties);
}

function resolveSchemaByType(
  type: JSONSchema7TypeName,
  schema: JSONSchema7Definition | undefined
): JSONSchema7 {
  if (typeof schema === 'boolean' || !schema) return {};

  if (schema.oneOf || schema.anyOf) {
    for (const oneOfOrAnyOfSchema of schema.oneOf ?? schema.anyOf ?? []) {
      if (typeof oneOfOrAnyOfSchema === 'boolean') continue;

      if (oneOfOrAnyOfSchema.type === type) {
        return { ...schema, ...oneOfOrAnyOfSchema };
      }
    }
  }

  return schema;
}
