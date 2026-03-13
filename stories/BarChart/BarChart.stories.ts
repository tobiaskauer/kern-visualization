import type { Meta, StoryObj } from '@storybook/html';
import { BarChart } from '../../src/charts/bar/bar-chart';

const meta: Meta = {
  title: 'Charts/BarChart',
  argTypes: {
    xAxisLabel:      { control: 'text',                                               name: 'X Axis Label' },
    yAxisLabel:      { control: 'text',                                               name: 'Y Axis Label' },
    caption:         { control: 'text',                                               name: 'Caption' },
    animated:        { control: 'boolean',                                            name: 'Animated' },
    showValueLabels: { control: 'boolean',                                            name: 'Show Value Labels' },
    gridlinesY:      { control: 'boolean',                                            name: 'Gridlines' },
    sort:            { control: { type: 'select' }, options: ['none', 'asc', 'desc'], name: 'Sort' },
  },
  args: {
    xAxisLabel:      'Monat',
    yAxisLabel:      'Wert',
    caption:         '',
    animated:        true,
    showValueLabels: false,
    gridlinesY:      true,
    sort:            'none',
  },
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

function createChart(args: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    new BarChart({
      container,
      data: args.data ?? sampleData,
      title: 'Monatliche Werte',
      animated: args.animated,
      showValueLabels: args.showValueLabels,
      xAxisLabel: args.xAxisLabel || undefined,
      yAxisLabel: args.yAxisLabel || undefined,
      caption: args.caption || undefined,
      gridlines: { y: args.gridlinesY },
      sort: args.sort,
      annotations: args.annotations,
    }).render();
  });

  return container;
}

export const Default: StoryObj = {
  render: (args) => createChart(args),
  name: 'Default',
};

export const WithValueLabels: StoryObj = {
  render: (args) => createChart(args),
  name: 'With Value Labels',
  args: { showValueLabels: true },
};

export const WithAnnotations: StoryObj = {
  render: (args) => createChart(args),
  name: 'With Annotations',
  args: { annotations: [{ axis: 'y', value: 60, label: 'Zielwert' }] },
};

export const EmptyState: StoryObj = {
  render: (args) => createChart({ ...args, data: [] }),
  name: 'Empty State',
};

const tooManyBarsData = [
  { label: 'Kategorie A', value: 42 },
  { label: 'Kategorie B', value: 68 },
  { label: 'Kategorie C', value: 35 },
  { label: 'Kategorie D', value: 82 },
  { label: 'Kategorie E', value: 55 },
  { label: 'Kategorie F', value: 90 },
  { label: 'Kategorie G', value: 47 },
  { label: 'Kategorie H', value: 63 },
  { label: 'Kategorie I', value: 29 },
  { label: 'Kategorie J', value: 74 },
  { label: 'Kategorie K', value: 51 },
  { label: 'Kategorie L', value: 38 },
  { label: 'Kategorie M', value: 66 },
  { label: 'Kategorie N', value: 43 },
  { label: 'Kategorie O', value: 87 },
];

export const TooManyBars: StoryObj = {
  render: (args) => createChart({ ...args, data: tooManyBarsData }),
  name: 'Too Many Bars (Don\'t)',
};
