import type { Meta, StoryObj } from '@storybook/html';
import { StackedBarChart } from '../../src/charts/stacked-bar/stacked-bar-chart';

const meta: Meta = {
  title: 'Charts/StackedBarChart',
  argTypes: {
    xAxisLabel: { control: 'text',    name: 'X Axis Label' },
    yAxisLabel: { control: 'text',    name: 'Y Axis Label' },
    caption:    { control: 'text',    name: 'Caption' },
    animated:   { control: 'boolean', name: 'Animated' },
    gridlinesY: { control: 'boolean', name: 'Gridlines' },
    legend:     { control: 'boolean', name: 'Legend' },
  },
  args: {
    xAxisLabel: 'Monat',
    yAxisLabel: 'Besucher',
    caption:    '',
    animated:   true,
    gridlinesY: true,
    legend:     true,
  },
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

function createChart(args: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    new StackedBarChart({
      container,
      data: args.data ?? sampleData,
      series,
      title: 'Traffic-Quellen',
      animated: args.animated,
      xAxisLabel: args.xAxisLabel || undefined,
      yAxisLabel: args.yAxisLabel || undefined,
      caption: args.caption || undefined,
      gridlines: { y: args.gridlinesY },
      legend: args.legend,
      annotations: args.annotations,
    }).render();
  });

  return container;
}

export const Default: StoryObj = {
  render: (args) => createChart(args),
  name: 'Default',
};

export const WithAnnotations: StoryObj = {
  render: (args) => createChart(args),
  name: 'With Annotations',
  args: { annotations: [{ axis: 'y', value: 50, label: 'Schwellenwert' }] },
};

export const EmptyState: StoryObj = {
  render: (args) => createChart({ ...args, data: [] }),
  name: 'Empty State',
};
