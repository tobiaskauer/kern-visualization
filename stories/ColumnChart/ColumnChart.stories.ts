import type { Meta, StoryObj } from '@storybook/html';
import { ColumnChart } from '../../src/charts/bar/column-chart';

const meta: Meta = {
  title: 'Charts/ColumnChart',
};

export default meta;

const sampleData = [
  { label: 'Berlin', value: 3645000 },
  { label: 'Hamburg', value: 1841000 },
  { label: 'München', value: 1488000 },
  { label: 'Köln', value: 1084000 },
  { label: 'Frankfurt', value: 759000 },
];

function createChart(config: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    const chart = new ColumnChart({
      container,
      data: config.data ?? sampleData,
      title: config.title ?? 'Bevölkerung nach Stadt',
      animated: config.animated ?? true,
      showValueLabels: config.showValueLabels ?? false,
      margin: { top: 20, right: 60, bottom: 40, left: 100 },
    });
    chart.render();
  });

  return container;
}

export const Default: StoryObj = {
  render: () => createChart({}),
  name: 'Default',
};

export const WithValueLabels: StoryObj = {
  render: () => createChart({ showValueLabels: true }),
  name: 'With Value Labels',
};

export const EmptyState: StoryObj = {
  render: () => createChart({ data: [] }),
  name: 'Empty State',
};
