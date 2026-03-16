import '../vendor/kern/fonts/fira-sans.css';
import '../vendor/kern/kern.css';
import type { Preview } from '@storybook/html';

export const globalTypes = {
  kernTheme: {
    name: 'Theme',
    description: 'KERN light/dark theme',
    defaultValue: 'light',
    toolbar: {
      title: 'Theme',
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
      showName: true,
      dynamicTitle: true,
    },
  },
};

export const decorators = [
  (Story: any, context: any) => {
    const theme = context.globals.kernTheme || 'light';
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-kern-theme', theme);
    wrapper.className = 'kern-story-wrapper';
    wrapper.style.background = 'var(--kern-color-layout-background-default)';
    wrapper.style.minHeight = 'fit-content';
    const storyEl = Story(context);
    if (storyEl instanceof HTMLElement) {
      wrapper.appendChild(storyEl);
    }
    return wrapper;
  },
];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Einführung', 'Charts'],
      },
    },
    docs: {
      canvas: {
        style: { padding: 0 },
      },
    },
  },
};

export default preview;
