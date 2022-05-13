import { JSONSchema7Type, JSONSchema7TypeName } from 'json-schema';

export function resolveType(value: JSONSchema7Type): JSONSchema7TypeName {
  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    default:
      return value === null
        ? 'null'
        : Array.isArray(value)
        ? 'array'
        : 'object';
  }
}
