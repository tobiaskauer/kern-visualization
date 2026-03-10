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
    wrapper.style.background = 'var(--kern-color-layout-background-default)';
    wrapper.style.padding = '24px';
    wrapper.style.minHeight = '100vh';
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
  },
};

export default preview;
