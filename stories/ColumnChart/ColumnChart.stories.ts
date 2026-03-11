import type { Meta, StoryObj } from '@storybook/html';
import { ColumnChart } from '../../src/charts/bar/column-chart';
import { StackedColumnChart } from '../../src/charts/stacked-bar/stacked-column-chart';

const meta: Meta = {
  title: 'Charts/ColumnChart',
};

export default meta;

const sampleData = [
  { label: 'Berlin', value: 3645000 },
  { label: 'Hamburg', value: 1841000 },
  { label: 'München', value: 1488000 },
  { label: 'Köln', value: 1084000 },
  { label: 'Frankfurt', value: 759000 },
];

const stackedSeries = ['Direkt', 'Organisch', 'Referral'];
const stackedData = [
  { label: 'Jan', Direkt: 20, Organisch: 15, Referral: 7 },
  { label: 'Feb', Direkt: 25, Organisch: 20, Referral: 10 },
  { label: 'Mär', Direkt: 18, Organisch: 12, Referral: 5 },
  { label: 'Apr', Direkt: 30, Organisch: 25, Referral: 12 },
];

function createChart(config: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    const chart = new ColumnChart({
      container,
      data: config.data ?? sampleData,
      title: config.title ?? 'Bevölkerung nach Stadt',
      animated: config.animated ?? true,
      showValueLabels: config.showValueLabels ?? false,
      margin: { top: 20, right: 60, bottom: 40, left: 100 },
      xAxisLabel: config.xAxisLabel,
      yAxisLabel: config.yAxisLabel,
      annotations: config.annotations,
    });
    chart.render();
  });

  return container;
}

function createStackedChart(config: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    const chart = new StackedColumnChart({
      container,
      data: config.data ?? stackedData,
      series: config.series ?? stackedSeries,
      title: 'Stacked Column',
      animated: true,
      margin: { top: 20, right: 20, bottom: 40, left: 80 },
      xAxisLabel: config.xAxisLabel,
      yAxisLabel: config.yAxisLabel,
      annotations: config.annotations,
      legend: config.legend,
    });
    chart.render();
  });

  return container;
}

export const Default: StoryObj = {
  render: () => createChart({}),
  name: 'Default',
};

export const WithValueLabels: StoryObj = {
  render: () => createChart({ showValueLabels: true }),
  name: 'With Value Labels',
};

export const WithAxisLabels: StoryObj = {
  render: () => createChart({ xAxisLabel: 'Einwohner', yAxisLabel: 'Stadt' }),
  name: 'With Axis Labels',
};

export const WithAnnotations: StoryObj = {
  render: () => createChart({
    annotations: [
      { axis: 'x', value: 2000000, label: '2M' },
    ],
  }),
  name: 'With Annotations',
};

export const EmptyState: StoryObj = {
  render: () => createChart({ data: [] }),
  name: 'Empty State',
};

export const Stacked: StoryObj = {
  render: () => createStackedChart({}),
  name: 'Stacked',
};

export const StackedWithAxisLabels: StoryObj = {
  render: () => createStackedChart({ xAxisLabel: 'Besucher', yAxisLabel: 'Monat' }),
  name: 'Stacked – With Axis Labels',
};

export const StackedWithAnnotations: StoryObj = {
  render: () => createStackedChart({
    annotations: [
      { axis: 'x', value: 40, label: 'Ziel' },
    ],
  }),
  name: 'Stacked – With Annotations',
};
