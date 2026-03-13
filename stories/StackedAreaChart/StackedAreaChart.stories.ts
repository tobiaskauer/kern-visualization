import type { Meta, StoryObj } from '@storybook/html';
import { StackedAreaChart } from '../../src/charts/stacked-area/stacked-area-chart';

const meta: Meta = {
  title: 'Charts/StackedAreaChart',
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
    yAxisLabel: 'Sitzungen',
    caption:    '',
    animated:   true,
    gridlinesY: true,
    legend:     true,
  },
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

function createChart(args: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    new StackedAreaChart({
      container,
      data: args.data ?? sampleData,
      series,
      title: 'Gerätenutzung über Zeit',
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
  args: { annotations: [{ axis: 'y', value: 80, label: 'Kapazität' }] },
};

export const EmptyState: StoryObj = {
  render: (args) => createChart({ ...args, data: [] }),
  name: 'Empty State',
};
