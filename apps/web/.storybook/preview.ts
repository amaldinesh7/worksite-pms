import type { Preview } from '@storybook/react-vite';

// Import global styles for Tailwind CSS
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#fafafa' },
        { name: 'dark', value: '#09090b' },
        { name: 'white', value: '#ffffff' },
      ],
    },
    layout: 'centered',
  },
};

export default preview;
