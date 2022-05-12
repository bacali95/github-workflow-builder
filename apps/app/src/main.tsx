import { createRoot } from 'react-dom/client';
import { Flowbite } from 'flowbite-react';

import { App } from './app/App';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <Flowbite>
    <App />
  </Flowbite>
);
