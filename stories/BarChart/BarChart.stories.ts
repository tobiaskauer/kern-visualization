import type { Meta, StoryObj } from '@storybook/html';
import { BarChart } from '../../src/charts/bar/bar-chart';
import { StackedBarChart } from '../../src/charts/stacked-bar/stacked-bar-chart';

const meta: Meta = {
  title: 'Charts/BarChart',
  argTypes: {
    xAxisLabel:      { control: 'text',    name: 'X Axis Label' },
    yAxisLabel:      { control: 'text',    name: 'Y Axis Label' },
    caption:         { control: 'text',    name: 'Caption' },
    animated:        { control: 'boolean', name: 'Animated' },
    showValueLabels: { control: 'boolean', name: 'Show Value Labels' },
    gridlinesY:      { control: 'boolean', name: 'Gridlines' },
    legend:          { control: 'boolean', name: 'Legend' },
  },
  args: {
    xAxisLabel:      '',
    yAxisLabel:      '',
    caption:         '',
    animated:        true,
    showValueLabels: false,
    gridlinesY:      true,
    legend:          true,
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

const stackedSeries = ['Direkt', 'Organisch', 'Referral'];
const stackedData = [
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
      annotations: args.annotations,
    }).render();
  });

  return container;
}

function createStackedChart(args: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    new StackedBarChart({
      container,
      data: args.data ?? stackedData,
      series: stackedSeries,
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

export const WithValueLabels: StoryObj = {
  render: (args) => createChart(args),
  name: 'With Value Labels',
  args: { showValueLabels: true },
};

export const WithAxisLabels: StoryObj = {
  render: (args) => createChart(args),
  name: 'With Axis Labels',
  args: { xAxisLabel: 'Monat', yAxisLabel: 'Wert' },
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

export const Stacked: StoryObj = {
  render: (args) => createStackedChart(args),
  name: 'Stacked',
};

export const StackedWithAxisLabels: StoryObj = {
  render: (args) => createStackedChart(args),
  name: 'Stacked – With Axis Labels',
  args: { xAxisLabel: 'Monat', yAxisLabel: 'Besucher' },
};

export const StackedWithAnnotations: StoryObj = {
  render: (args) => createStackedChart(args),
  name: 'Stacked – With Annotations',
  args: { annotations: [{ axis: 'y', value: 50, label: 'Schwellenwert' }] },
};

export const StackedEmptyState: StoryObj = {
  render: (args) => createStackedChart({ ...args, data: [] }),
  name: 'Stacked – Empty State',
};
