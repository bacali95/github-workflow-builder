import { JSONSchema7Definition } from 'json-schema';

const cache = new Set();

export function resolveSchema(
  schema: JSONSchema7Definition | undefined,
  definitions: Record<string, JSONSchema7Definition>
): JSONSchema7Definition | undefined {
  if (typeof schema === 'boolean' || !schema) return schema;

  if (schema.items) {
    schema.items =
      schema.items instanceof Array
        ? resolveSchemaArray(schema.items, definitions)
        : resolveSchema(schema.items, definitions);
  }
  if (schema.additionalItems) {
    schema.additionalItems = resolveSchema(schema.additionalItems, definitions);
  }

  if (schema.properties) {
    schema.properties = resolveSchemaMap(schema.properties, definitions);
  }
  if (schema.patternProperties) {
    schema.patternProperties = resolveSchemaMap(
      schema.patternProperties,
      definitions
    );
  }
  if (schema.additionalProperties) {
    schema.additionalProperties = resolveSchema(
      schema.additionalProperties,
      definitions
    );
  }
  if (schema.propertyNames) {
    schema.propertyNames = resolveSchema(schema.propertyNames, definitions);
  }

  if (schema.if) {
    schema.if = resolveSchema(schema.if, definitions);
  }
  if (schema.then) {
    schema.then = resolveSchema(schema.then, definitions);
  }
  if (schema.else) {
    schema.else = resolveSchema(schema.else, definitions);
  }

  if (schema.allOf) {
    schema.allOf = resolveSchemaArray(schema.allOf, definitions);
  }
  if (schema.anyOf) {
    schema.anyOf = resolveSchemaArray(schema.anyOf, definitions);
  }
  if (schema.oneOf) {
    schema.oneOf = resolveSchemaArray(schema.oneOf, definitions);
  }
  if (schema.not) {
    schema.not = resolveSchema(schema.not, definitions);
  }

  if (schema.$ref) {
    const definitionName = schema.$ref.split('/').pop() ?? '';

    if (!cache.has(definitionName)) {
      cache.add(definitionName);
      const definition = resolveSchema(
        definitions[definitionName],
        definitions
      );
      cache.delete(definitionName);

      if (typeof definition === 'boolean' || !definition) return schema;

      schema = { ...definition, ...schema };
    }

    delete schema.$ref;
  }

  return schema;
}

function resolveSchemaMap(
  schemaMap: Record<string, JSONSchema7Definition> | undefined,
  definitions: Record<string, JSONSchema7Definition>
): Record<string, JSONSchema7Definition> | undefined {
  if (schemaMap) {
    for (const key of Object.keys(schemaMap)) {
      schemaMap[key] = resolveSchema(schemaMap[key], definitions) ?? {};
    }
  }

  return schemaMap;
}

function resolveSchemaArray(
  schemaArray: Array<JSONSchema7Definition> | undefined,
  definitions: Record<string, JSONSchema7Definition>
): Array<JSONSchema7Definition> | undefined {
  if (schemaArray) {
    for (const index of Object.keys(schemaArray)) {
      schemaArray[+index] =
        resolveSchema(schemaArray[+index], definitions) ?? {};
    }
  }

  return schemaArray;
}
