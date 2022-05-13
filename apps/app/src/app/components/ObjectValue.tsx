import { FC, useState } from 'react';
import { Props } from './types';
import { JSONSchema7Object } from 'json-schema';
import { handleOnChange, resolveDefinition, resolveType } from '../helpers';
import { SchemaSwitch } from './SchemaSwitch';
import { SchemaItemSwitch } from './SchemaSwitchItem';
import { ExpandedCard } from './ExpandedCard';

export const ObjectValue: FC<Props> = (props) => {
  const { parentJson, json, propertyName, schema, definitions, onChange } =
    props;
  const [expandedItem, setExpendedItem] = useState<Props>();

  if (typeof schema === 'boolean') return null;

  const properties = { ...schema.properties, ...schema.patternProperties };

  return (
    <ExpandedCard
      label={(json as any)['name'] ?? propertyName ?? 'Workflow'}
      onLabelClick={() => setExpendedItem(undefined)}
    >
      {expandedItem ? (
        <SchemaSwitch {...expandedItem} />
      ) : (
        Object.entries(json as JSONSchema7Object).map(([key, value], index) => {
          if (!value) return undefined;

          const schemaKey = Object.keys(properties).find((propertyName) =>
            new RegExp(propertyName).test(key)
          );

          if (!schemaKey) return undefined;

          const schema = resolveDefinition(
            resolveType(value),
            properties[schemaKey],
            definitions
          );
          const itemProps = {
            parentJson: json as JSONSchema7Object,
            json: value,
            propertyName: key,
            schema,
            definitions,
            onChange: handleOnChange(parentJson, propertyName, onChange),
          };

          return (
            <SchemaItemSwitch
              key={index}
              {...itemProps}
              onClick={() => setExpendedItem(itemProps)}
            />
          );
        })
      )}
    </ExpandedCard>
  );
};
