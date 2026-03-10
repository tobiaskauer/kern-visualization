import type { Meta, StoryObj } from '@storybook/html';
import { StackedBarChart } from '../../src/charts/stacked-bar/stacked-bar-chart';

const meta: Meta = {
  title: 'Charts/StackedBarChart',
};

export default meta;

const series = ['Direkt', 'Organisch', 'Referral'];
const sampleData = [
  { label: 'Jan', Direkt: 20, Organisch: 15, Referral: 7 },
  { label: 'Feb', Direkt: 25, Organisch: 20, Referral: 10 },
  { label: 'Mär', Direkt: 18, Organisch: 12, Referral: 5 },
  { label: 'Apr', Direkt: 30, Organisch: 25, Referral: 12 },
  { label: 'Mai', Direkt: 22, Organisch: 18, Referral: 9 },
];

function createChart(config: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    const chart = new StackedBarChart({
      container,
      data: config.data ?? sampleData,
      series: config.series ?? series,
      title: 'Traffic-Quellen',
      animated: true,
    });
    chart.render();
  });

  return container;
}

export const Default: StoryObj = {
  render: () => createChart({}),
  name: 'Default',
};

export const EmptyState: StoryObj = {
  render: () => createChart({ data: [] }),
  name: 'Empty State',
};
