import { ChangeEvent, FC } from 'react';
import {
  JSONSchema7,
  JSONSchema7Array,
  JSONSchema7Definition,
  JSONSchema7Object,
  JSONSchema7Type,
  JSONSchema7TypeName,
} from 'json-schema';
import classNames from 'classnames';
import { Label, TextInput } from 'flowbite-react';
import { BsArrowReturnRight } from 'react-icons/bs';

type Props = {
  parentJson?: JSONSchema7Object | JSONSchema7Array;
  json: JSONSchema7Type;
  propertyName?: string;
  level?: number;
  arrayParent?: boolean;
  schema: JSONSchema7Definition;
  definitions: Record<string, JSONSchema7Definition>;
  onChange?: (json: JSONSchema7Type) => void;
};

const handleOnChange =
  (
    json?: JSONSchema7Object | JSONSchema7Array,
    propertyName?: string,
    onChange?: (json: JSONSchema7Type) => void
  ) =>
  (value: JSONSchema7Type) => {
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

export const SchemaSwitch: FC<Props> = ({
  parentJson,
  json,
  propertyName,
  level = -1,
  arrayParent,
  schema,
  definitions,
  onChange,
}) => {
  if (typeof schema === 'boolean') return null;

  switch (schema.type) {
    case 'object':
      schema = resolveDefinition('object', schema, definitions);
      return (
        <ObjectValue
          parentJson={parentJson}
          json={json as JSONSchema7Object}
          propertyName={propertyName}
          level={level + 1}
          arrayParent={arrayParent}
          properties={{ ...schema.properties, ...schema.patternProperties }}
          definitions={definitions}
          onChange={onChange}
        />
      );
    case 'array':
      schema = resolveDefinition('array', schema, definitions);
      return (
        <ArrayValue
          parentJson={parentJson}
          array={json as JSONSchema7Array}
          propertyName={propertyName}
          level={level + 1}
          schema={
            schema.items instanceof Array ? schema.items[0] : schema.items ?? {}
          }
          definitions={definitions}
          onChange={onChange}
        />
      );
  }

  return (
    <PrimitiveValue
      parentJson={parentJson}
      value={json as string | number | boolean | null}
      propertyName={propertyName}
      arrayParent={arrayParent}
      onChange={onChange}
    />
  );
};

const PrimitiveValue: FC<{
  parentJson?: JSONSchema7Object | JSONSchema7Array;
  value: string | number | boolean | null;
  propertyName?: string;
  arrayParent?: boolean;
  onChange?: (json: JSONSchema7Type) => void;
}> = ({ parentJson, value, propertyName, arrayParent, onChange }) => {
  const handleOnInputChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleOnChange(parentJson, propertyName, onChange)(event.target.value);

  return (
    <div className="flex items-center gap-2">
      {arrayParent ? (
        <BsArrowReturnRight className="h-8 w-4 pt-2" />
      ) : (
        propertyName && <Label>{propertyName}:</Label>
      )}
      <TextInput value={String(value)} onChange={handleOnInputChange} />
    </div>
  );
};

const ArrayValue: FC<{
  parentJson?: JSONSchema7Object | JSONSchema7Array;
  array: JSONSchema7Array;
  propertyName?: string;
  level: number;
  schema: JSONSchema7Definition;
  definitions: Record<string, JSONSchema7Definition>;
  onChange?: (json: JSONSchema7Type) => void;
}> = ({
  parentJson,
  array,
  propertyName,
  level,
  schema,
  definitions,
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-1" style={{ paddingLeft: 2 * level }}>
      {propertyName && <Label>{propertyName}:</Label>}
      {array.map(
        (value, index) =>
          value !== undefined && (
            <SchemaSwitch
              key={index}
              parentJson={array}
              json={value}
              level={level + 1}
              arrayParent
              propertyName={index.toString()}
              schema={schema}
              definitions={definitions}
              onChange={handleOnChange(parentJson, propertyName, onChange)}
            />
          )
      )}
    </div>
  );
};

const ObjectValue: FC<{
  parentJson?: JSONSchema7Object | JSONSchema7Array;
  json: JSONSchema7Object;
  propertyName?: string;
  level: number;
  arrayParent?: boolean;
  properties: Record<string, JSONSchema7Definition>;
  definitions: Record<string, JSONSchema7Definition>;
  onChange?: (json: JSONSchema7Type) => void;
}> = ({
  parentJson,
  json,
  propertyName,
  level,
  arrayParent,
  properties,
  definitions,
  onChange,
}) => {
  return (
    <div
      className={classNames('flex', !arrayParent ? 'flex-col gap-1' : 'gap-2')}
      style={{ paddingLeft: 2 * level }}
    >
      {arrayParent ? (
        <BsArrowReturnRight className="h-8 w-4 pt-2" />
      ) : (
        propertyName && <Label>{propertyName}:</Label>
      )}
      <div className="flex flex-col gap-1">
        {Object.entries(json).map(([key, value], index) => {
          const schema = Object.keys(properties).find((propertyName) =>
            new RegExp(propertyName).test(key)
          );

          return (
            value !== undefined &&
            schema && (
              <SchemaSwitch
                key={index}
                parentJson={json}
                json={value}
                propertyName={key}
                level={level + 1}
                schema={resolveDefinition(
                  resolveType(value),
                  properties[schema],
                  definitions
                )}
                definitions={definitions}
                onChange={handleOnChange(parentJson, propertyName, onChange)}
              />
            )
          );
        })}
      </div>
    </div>
  );
};

function resolveType(value: JSONSchema7Type): JSONSchema7TypeName {
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

function resolveDefinition(
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
