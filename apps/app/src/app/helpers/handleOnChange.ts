import {
  JSONSchema7Array,
  JSONSchema7Object,
  JSONSchema7Type,
} from 'json-schema';

export function handleOnChange(
  json?: JSONSchema7Object | JSONSchema7Array,
  propertyName?: string,
  onChange?: (json: JSONSchema7Type) => void
): (value: JSONSchema7Type) => void {
  return (value) => {
    if (propertyName && json) {
      if (json instanceof Array) {
        json[+propertyName] = value;
      } else {
        json[propertyName] = value;
      }
      onChange?.(json);
    } else {
      onChange?.(value);
    }
  };
}
