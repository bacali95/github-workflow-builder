import { FC } from 'react';
import { Props } from './types';
import { PrimitiveValue } from './PrimitiveValue';
import { ArrayValue } from './ArrayValue';
import { ObjectValue } from './ObjectValue';

export const SchemaSwitch: FC<Props> = (props) => {
  if (typeof props.schema === 'boolean') return null;

  switch (props.schema.type) {
    case 'object':
      return <ObjectValue {...props} />;
    case 'array':
      return <ArrayValue {...props} />;
  }

  return <PrimitiveValue {...props} />;
};
