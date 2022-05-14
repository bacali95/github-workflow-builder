import { FC, useState } from 'react';
import { Props } from './types';
import { JSONSchema7Object } from 'json-schema';
import { handleOnChange, resolvePropertySchema, resolveType } from '../helpers';
import { SchemaSwitch } from './SchemaSwitch';
import { SchemaItemSwitch } from './SchemaSwitchItem';
import { ExpandedCard } from './ExpandedCard';

export const ObjectValue: FC<Props> = (props) => {
  const { parentJson, json, propertyName, schema, definitions, onChange } =
    props;
  const [expandedItem, setExpendedItem] = useState<Props>();

  if (typeof schema === 'boolean') return null;

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

          const newSchema = resolvePropertySchema(
            key,
            resolveType(value),
            schema,
            definitions
          );

          if (!newSchema) return undefined;

          const itemProps = {
            parentJson: json as JSONSchema7Object,
            json: value,
            propertyName: key,
            schema: newSchema,
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
