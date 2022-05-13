import { FC, useState } from 'react';
import { Props } from './types';
import { JSONSchema7Array } from 'json-schema';
import { handleOnChange } from '../helpers';
import { SchemaSwitch } from './SchemaSwitch';
import { SchemaItemSwitch } from './SchemaSwitchItem';
import { ExpandedCard } from './ExpandedCard';

export const ArrayValue: FC<Props> = (props) => {
  const {
    parentJson,
    json: array,
    propertyName,
    schema,
    definitions,
    onChange,
  } = props;
  const [expandedItem, setExpendedItem] = useState<Props>();

  if (typeof schema === 'boolean') return null;

  return (
    <ExpandedCard
      label={propertyName ?? ''}
      onLabelClick={() => setExpendedItem(undefined)}
    >
      {expandedItem ? (
        <SchemaSwitch {...expandedItem} />
      ) : (
        (array as JSONSchema7Array).map((value, index) => {
          if (!value) return undefined;

          const newSchema =
            schema.items instanceof Array
              ? schema.items[0]
              : schema.items ?? {};
          const itemProps = {
            parentJson: array as JSONSchema7Array,
            json: value,
            propertyName: index.toString(),
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
