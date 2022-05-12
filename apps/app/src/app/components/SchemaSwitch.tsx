import { FC } from 'react';
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
  json: JSONSchema7Type;
  propertyName?: string;
  level?: number;
  arrayParent?: boolean;
  schema: JSONSchema7Definition;
  definitions: Record<string, JSONSchema7Definition>;
};

export const SchemaSwitch: FC<Props> = ({
  json,
  propertyName,
  level = -1,
  arrayParent,
  schema,
  definitions,
}) => {
  if (typeof schema === 'boolean') return null;

  switch (schema.type) {
    case 'object':
      schema = resolveDefinition('object', schema, definitions);
      return (
        <ObjectValue
          json={json as JSONSchema7Object}
          propertyName={propertyName}
          level={level + 1}
          arrayParent={arrayParent}
          properties={{ ...schema.properties, ...schema.patternProperties }}
          definitions={definitions}
        />
      );
    case 'array':
      schema = resolveDefinition('array', schema, definitions);
      return (
        <ArrayValue
          json={json as JSONSchema7Array}
          propertyName={propertyName}
          level={level + 1}
          schema={
            schema.items instanceof Array ? schema.items[0] : schema.items ?? {}
          }
          definitions={definitions}
        />
      );
  }

  return (
    <PrimitiveValue
      value={json as string | number | boolean | null}
      propertyName={propertyName}
      arrayParent={arrayParent}
    />
  );
};

const PrimitiveValue: FC<{
  value: string | number | boolean | null;
  propertyName?: string;
  arrayParent?: boolean;
}> = ({ value, propertyName, arrayParent }) => {
  return (
    <div className="flex items-center gap-2">
      {arrayParent ? (
        <BsArrowReturnRight className="h-8 w-4 pt-2" />
      ) : (
        propertyName && <Label>{propertyName}:</Label>
      )}
      <TextInput value={JSON.stringify(value)} />
    </div>
  );
};

const ArrayValue: FC<{
  json: JSONSchema7Array;
  propertyName?: string;
  level: number;
  schema: JSONSchema7Definition;
  definitions: Record<string, JSONSchema7Definition>;
}> = ({ json, propertyName, level, schema, definitions }) => {
  console.log(new Array(level).fill(' '));
  return (
    <div className="flex flex-col gap-1" style={{ paddingLeft: 2 * level }}>
      {propertyName && <Label>{propertyName}:</Label>}
      {json.map(
        (value, index) =>
          value && (
            <SchemaSwitch
              key={index}
              json={value}
              level={level + 1}
              arrayParent
              propertyName={index.toString()}
              schema={schema}
              definitions={definitions}
            />
          )
      )}
    </div>
  );
};

const ObjectValue: FC<{
  json: JSONSchema7Object;
  propertyName?: string;
  level: number;
  arrayParent?: boolean;
  properties: Record<string, JSONSchema7Definition>;
  definitions: Record<string, JSONSchema7Definition>;
}> = ({ json, propertyName, level, arrayParent, properties, definitions }) => {
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
            value &&
            schema && (
              <SchemaSwitch
                key={index}
                json={value}
                propertyName={key}
                level={level + 1}
                schema={resolveDefinition(
                  resolveType(value),
                  properties[schema],
                  definitions
                )}
                definitions={definitions}
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
