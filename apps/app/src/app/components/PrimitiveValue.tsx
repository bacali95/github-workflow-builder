import { ChangeEvent, FC } from 'react';
import { Props } from './types';
import { handleOnChange } from '../helpers';
import { Label, TextInput } from 'flowbite-react';

export const PrimitiveValue: FC<Props> = ({
  parentJson,
  json: value,
  propertyName,
  onChange,
}) => {
  const handleOnInputChange = (event: ChangeEvent<HTMLInputElement>) =>
    handleOnChange(parentJson, propertyName, onChange)(event.target.value);

  return (
    <div className="flex flex-col justify-center gap-1 p-2">
      {propertyName && (
        <Label className="ml-1 w-fit rounded-md bg-gray-200 p-2 py-1 dark:bg-gray-700">
          {propertyName}
        </Label>
      )}
      <TextInput
        className="min-w-[200px]"
        value={String(value)}
        onChange={handleOnInputChange}
      />
    </div>
  );
};
