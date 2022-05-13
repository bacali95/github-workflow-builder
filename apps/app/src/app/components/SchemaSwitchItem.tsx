import { FC } from 'react';
import { ExpandableCard } from './ExpandableCard';
import { PrimitiveValue } from './PrimitiveValue';
import { Props } from './types';

export const SchemaItemSwitch: FC<Props & { onClick: () => void }> = ({
  onClick,
  ...props
}) => {
  if (typeof props.schema === 'boolean') return null;

  switch (props.schema.type) {
    case 'object':
      return (
        <ExpandableCard onClick={onClick}>
          {(props.json as any)['name'] ?? props.propertyName}
        </ExpandableCard>
      );
    case 'array':
      return (
        <ExpandableCard onClick={onClick}>
          {(props.json as any)['name'] ?? props.propertyName}
        </ExpandableCard>
      );
  }

  return <PrimitiveValue {...props} />;
};
