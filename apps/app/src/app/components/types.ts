import {
  JSONSchema7Array,
  JSONSchema7Definition,
  JSONSchema7Object,
  JSONSchema7Type,
} from 'json-schema';

export type Props = {
  parentJson?: JSONSchema7Object | JSONSchema7Array;
  json: JSONSchema7Type;
  propertyName?: string;
  schema: JSONSchema7Definition;
  definitions: Record<string, JSONSchema7Definition>;
  onChange?: (json: JSONSchema7Type) => void;
};
