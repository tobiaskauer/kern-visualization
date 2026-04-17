import type { Meta, StoryObj } from '@storybook/html';
import { StackedAreaChart } from '../../src/charts/stacked-area/stacked-area-chart';

const meta: Meta = {
  title: 'Charts/StackedAreaChart',
  argTypes: {
    headline:       { control: 'text', name: 'Überschrift',      table: { category: 'Beschriftung' } },
    subheadline:    { control: 'text', name: 'Unterüberschrift',  table: { category: 'Beschriftung' } },
    caption:        { control: 'text', name: 'Caption',           table: { category: 'Beschriftung' } },
    xAxisLabel:     { control: 'text',    name: 'X Axis Label' },
    yAxisLabel:     { control: 'text',    name: 'Y Axis Label' },
    animated:       { control: 'boolean', name: 'Animated' },
    gridlinesY:     { control: 'boolean', name: 'Gridlines' },
    legend:         { control: 'boolean', name: 'Legend' },
    legendPosition: { control: { type: 'select' }, options: ['bottom', 'inline'], name: 'Legend Position' },
  },
  args: {
    headline:       '',
    subheadline:    '',
    xAxisLabel:     'Monat',
    yAxisLabel:     'Sitzungen',
    caption:        '',
    animated:       true,
    gridlinesY:     true,
    legend:         true,
    legendPosition: 'bottom',
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
  container.style.maxWidth = '600px';
  container.style.width = '100%';

  requestAnimationFrame(() => {
    new StackedAreaChart({
      container,
      data: args.data ?? sampleData,
      series,
      title: 'Gerätenutzung über Zeit',
      animated: args.animated,
      headline: args.headline || undefined,
      subheadline: args.subheadline || undefined,
      xAxisLabel: args.xAxisLabel || undefined,
      yAxisLabel: args.yAxisLabel || undefined,
      caption: args.caption || undefined,
      gridlines: { y: args.gridlinesY },
      legend: args.legend,
      legendPosition: args.legendPosition,
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

export const InlineLabels: StoryObj = {
  render: (args) => createChart(args),
  name: 'Inline Labels',
  args: { legendPosition: 'inline' },
};
