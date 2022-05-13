import { FC } from 'react';
import { Label } from 'flowbite-react';

export const ExpandableCard: FC<{ children: string; onClick: () => void }> = ({
  children,
  onClick,
}) => (
  <div className="flex flex-col justify-center gap-1 p-2">
    <Label
      className="ml-1 w-fit max-w-[12rem] truncate rounded-md bg-gray-200 p-2 py-1 dark:bg-gray-700"
      title={children}
    >
      {children}
    </Label>
    <button
      className="rounded-md border bg-gray-100 py-8 px-16 hover:bg-gray-200 dark:border-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
      onClick={onClick}
    >
      Click to expand
    </button>
  </div>
);
