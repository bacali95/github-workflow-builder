import {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7TypeName,
} from 'json-schema';

export function resolveDefinition(
  type: JSONSchema7TypeName,
  schema: JSONSchema7Definition,
  definitions: Record<string, JSONSchema7Definition>
): JSONSchema7 {
  if (typeof schema === 'boolean') return {};

  if (schema.$ref) {
    const definitionName = schema.$ref.split('/').pop() ?? '';
    const definition = resolveDefinition(
      type,
      definitions[definitionName],
      definitions
    );

    schema = { ...definition, ...schema };
  }

  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties !== 'boolean'
  ) {
    schema.patternProperties = {
      ...schema.patternProperties,
      '^.*$': resolveDefinition(type, schema.additionalProperties, definitions),
    };
  }

  if (schema.oneOf || schema.anyOf) {
    for (let oneOfOrAnyOfSchema of schema.oneOf ?? schema.anyOf ?? []) {
      if (typeof oneOfOrAnyOfSchema === 'boolean') continue;

      oneOfOrAnyOfSchema = resolveDefinition(
        type,
        oneOfOrAnyOfSchema,
        definitions
      );

      if (oneOfOrAnyOfSchema.type === type) {
        return { ...schema, ...oneOfOrAnyOfSchema };
      }
    }
  }

  return schema;
}
