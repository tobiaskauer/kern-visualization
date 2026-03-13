import type { Meta, StoryObj } from '@storybook/html';
import { LineChart } from '../../src/charts/line/line-chart';

const meta: Meta = {
  title: 'Charts/LineChart',
  argTypes: {
    xAxisLabel:  { control: 'text',    name: 'X Axis Label' },
    yAxisLabel:  { control: 'text',    name: 'Y Axis Label' },
    caption:     { control: 'text',    name: 'Caption' },
    animated:    { control: 'boolean', name: 'Animated' },
    gridlinesY:  { control: 'boolean', name: 'Gridlines' },
    legend:      { control: 'boolean', name: 'Legend' },
    colorScheme: { control: { type: 'select' }, options: ['categorical', 'sequential', 'diverging'], name: 'Color Scheme' },
  },
  args: {
    xAxisLabel:  'Quartal',
    yAxisLabel:  'Umsatz',
    caption:     '',
    animated:    true,
    gridlinesY:  true,
    legend:      true,
    colorScheme: 'categorical',
  },
};

export default meta;

const sampleSeries = [
  {
    name: 'Produkt A',
    data: [
      { label: 'Q1', value: 42 },
      { label: 'Q2', value: 68 },
      { label: 'Q3', value: 55 },
      { label: 'Q4', value: 90 },
    ],
  },
  {
    name: 'Produkt B',
    data: [
      { label: 'Q1', value: 30 },
      { label: 'Q2', value: 45 },
      { label: 'Q3', value: 70 },
      { label: 'Q4', value: 60 },
    ],
  },
];

function createChart(args: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    new LineChart({
      container,
      series: args.series ?? sampleSeries,
      title: 'Quartalsvergleich',
      animated: args.animated,
      xAxisLabel: args.xAxisLabel || undefined,
      yAxisLabel: args.yAxisLabel || undefined,
      caption: args.caption || undefined,
      gridlines: { y: args.gridlinesY },
      legend: args.legend,
      colorScheme: args.colorScheme,
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
  args: { annotations: [{ axis: 'y', value: 65, label: 'Zielwert' }] },
};

const singlePointSeries = [
  {
    name: 'Produkt A',
    data: [{ label: 'Q1', value: 42 }],
  },
];

export const SinglePoint: StoryObj = {
  render: (args) => createChart({ ...args, series: singlePointSeries }),
  name: 'Single Data Point (Don\'t)',
};
