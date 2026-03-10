import type { Meta, StoryObj } from '@storybook/html';
import { BarChart } from '../../src/charts/bar/bar-chart';

const meta: Meta = {
  title: 'Charts/BarChart',
};

export default meta;

const sampleData = [
  { label: 'Jan', value: 42 },
  { label: 'Feb', value: 68 },
  { label: 'Mär', value: 35 },
  { label: 'Apr', value: 82 },
  { label: 'Mai', value: 55 },
  { label: 'Jun', value: 90 },
];

function createChart(config: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    const chart = new BarChart({
      container,
      data: config.data ?? sampleData,
      title: config.title ?? 'Monatliche Werte',
      animated: config.animated ?? true,
      showValueLabels: config.showValueLabels ?? false,
      xAxisLabel: config.xAxisLabel,
      yAxisLabel: config.yAxisLabel,
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

export const WithAxisLabels: StoryObj = {
  render: () => createChart({ xAxisLabel: 'Monat', yAxisLabel: 'Wert' }),
  name: 'With Axis Labels',
};

export const EmptyState: StoryObj = {
  render: () => createChart({ data: [] }),
  name: 'Empty State',
};
