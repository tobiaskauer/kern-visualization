import type { Meta, StoryObj } from '@storybook/html';
import { StackedColumnChart } from '../../src/charts/stacked-bar/stacked-column-chart';

const meta: Meta = {
  title: 'Charts/StackedColumnChart',
  argTypes: {
    xAxisLabel: { control: 'text',    name: 'X Axis Label' },
    yAxisLabel: { control: 'text',    name: 'Y Axis Label' },
    caption:    { control: 'text',    name: 'Caption' },
    animated:   { control: 'boolean', name: 'Animated' },
    gridlinesX: { control: 'boolean', name: 'Gridlines' },
    legend:     { control: 'boolean', name: 'Legend' },
  },
  args: {
    xAxisLabel: 'Besucher',
    yAxisLabel: 'Monat',
    caption:    '',
    animated:   true,
    gridlinesX: true,
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
];

function createChart(args: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    new StackedColumnChart({
      container,
      data: args.data ?? sampleData,
      series,
      title: 'Traffic-Quellen',
      animated: args.animated,
      margin: { top: 20, right: 20, bottom: 40, left: 80 },
      xAxisLabel: args.xAxisLabel || undefined,
      yAxisLabel: args.yAxisLabel || undefined,
      caption: args.caption || undefined,
      gridlines: { x: args.gridlinesX },
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
  args: { annotations: [{ axis: 'x', value: 40, label: 'Ziel' }] },
};

export const EmptyState: StoryObj = {
  render: (args) => createChart({ ...args, data: [] }),
  name: 'Empty State',
};
