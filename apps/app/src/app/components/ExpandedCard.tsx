import { FC, ReactNode } from 'react';
import { Label } from 'flowbite-react';

export const ExpandedCard: FC<{
  children: ReactNode;
  label: string;
  onLabelClick: () => void;
}> = ({ children, label, onLabelClick }) => (
  <div className="flex h-full w-full flex-col justify-center gap-1 overflow-auto p-2">
    <Label
      className="ml-1 w-fit rounded-md bg-gray-200 p-2 py-1 dark:bg-gray-700"
      onClick={onLabelClick}
      role="button"
    >
      {label}
    </Label>
    <div className="relative h-full w-full rounded-md border dark:border-gray-800">
      <div className="relative flex h-full w-full justify-center">
        {children}
      </div>
    </div>
  </div>
);
