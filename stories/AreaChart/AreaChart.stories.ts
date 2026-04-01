import type { Meta, StoryObj } from '@storybook/html';
import { AreaChart } from '../../src/charts/area/area-chart';

const meta: Meta = {
  title: 'Charts/AreaChart',
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
    yAxisLabel: 'Einnahmen (€)',
    caption:    '',
    animated:   true,
    gridlinesY: true,
    legend:     true,
  },
};

export default meta;

const sampleSeries = [
  {
    name: 'Einnahmen',
    data: [
      { label: 'Jan', value: 30 },
      { label: 'Feb', value: 50 },
      { label: 'Mär', value: 45 },
      { label: 'Apr', value: 70 },
      { label: 'Mai', value: 65 },
      { label: 'Jun', value: 85 },
    ],
  },
  {
    name: 'Ausgaben',
    data: [
      { label: 'Jan', value: 20 },
      { label: 'Feb', value: 35 },
      { label: 'Mär', value: 30 },
      { label: 'Apr', value: 55 },
      { label: 'Mai', value: 48 },
      { label: 'Jun', value: 60 },
    ],
  },
];

function createChart(args: any): HTMLElement {
  const container = document.createElement('div');
  container.style.maxWidth = '600px';
  container.style.width = '100%';

  requestAnimationFrame(() => {
    new AreaChart({
      container,
      series: args.series ?? sampleSeries,
      title: 'Einnahmenverlauf',
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

export const SingleSeries: StoryObj = {
  render: (args) => createChart({ ...args, series: [sampleSeries[0]] }),
  name: 'Single Series',
};

export const WithAnnotations: StoryObj = {
  render: (args) => createChart(args),
  name: 'With Annotations',
  args: { annotations: [{ axis: 'y', value: 60, label: 'Zielwert' }] },
};
