import type { Meta, StoryObj } from '@storybook/html';
import { ColumnChart } from '../../src/charts/bar/column-chart';

const meta: Meta = {
  title: 'Charts/ColumnChart',
  argTypes: {
    xAxisLabel:      { control: 'text',                                               name: 'X Axis Label' },
    yAxisLabel:      { control: 'text',                                               name: 'Y Axis Label' },
    caption:         { control: 'text',                                               name: 'Caption' },
    animated:        { control: 'boolean',                                            name: 'Animated' },
    showValueLabels: { control: 'boolean',                                            name: 'Show Value Labels' },
    gridlinesX:      { control: 'boolean',                                            name: 'Gridlines' },
    sort:            { control: { type: 'select' }, options: ['none', 'asc', 'desc'], name: 'Sort' },
  },
  args: {
    xAxisLabel:      'Einwohner',
    yAxisLabel:      'Stadt',
    caption:         '',
    animated:        true,
    showValueLabels: false,
    gridlinesX:      true,
    sort:            'none',
  },
};

export default meta;

const sampleData = [
  { label: 'Berlin',    value: 3645000 },
  { label: 'Hamburg',   value: 1841000 },
  { label: 'München',   value: 1488000 },
  { label: 'Köln',      value: 1084000 },
  { label: 'Frankfurt', value:  759000 },
];

function createChart(args: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    new ColumnChart({
      container,
      data: args.data ?? sampleData,
      title: 'Bevölkerung nach Stadt',
      animated: args.animated,
      showValueLabels: args.showValueLabels,
      margin: { top: 20, right: 60, bottom: 40, left: 100 },
      xAxisLabel: args.xAxisLabel || undefined,
      yAxisLabel: args.yAxisLabel || undefined,
      caption: args.caption || undefined,
      gridlines: { x: args.gridlinesX },
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
  args: { annotations: [{ axis: 'x', value: 2000000, label: '2M' }] },
};

export const EmptyState: StoryObj = {
  render: (args) => createChart({ ...args, data: [] }),
  name: 'Empty State',
};

const longLabelData = [
  { label: 'Nordrhein-Westfalen', value: 17900000 },
  { label: 'Bayern', value: 13100000 },
  { label: 'Baden-Württemberg', value: 11100000 },
  { label: 'Niedersachsen', value: 7990000 },
  { label: 'Hessen', value: 6290000 },
];

export const LongLabels: StoryObj = {
  render: (args) => createChart({ ...args, data: longLabelData }),
  name: 'Long Labels (Don\'t)',
};
