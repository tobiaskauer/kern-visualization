import type { Meta, StoryObj } from '@storybook/html';
import { StackedAreaChart } from '../../src/charts/stacked-area/stacked-area-chart';

const meta: Meta = {
  title: 'Charts/StackedAreaChart',
};

export default meta;

const series = ['Desktop', 'Mobile', 'Tablet'];
const sampleData = [
  { label: 'Jan', Desktop: 40, Mobile: 25, Tablet: 10 },
  { label: 'Feb', Desktop: 45, Mobile: 30, Tablet: 12 },
  { label: 'Mär', Desktop: 38, Mobile: 35, Tablet: 11 },
  { label: 'Apr', Desktop: 50, Mobile: 40, Tablet: 15 },
  { label: 'Mai', Desktop: 55, Mobile: 42, Tablet: 14 },
];

function createChart(config: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    const chart = new StackedAreaChart({
      container,
      data: config.data ?? sampleData,
      series: config.series ?? series,
      title: 'Gerätenutzung über Zeit',
    });
    chart.render();
  });

  return container;
}

export const Default: StoryObj = {
  render: () => createChart({}),
  name: 'Default',
};
