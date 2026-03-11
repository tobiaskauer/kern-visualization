import type { Meta, StoryObj } from '@storybook/html';
import { BarChart } from '../../src/charts/bar/bar-chart';
import { StackedBarChart } from '../../src/charts/stacked-bar/stacked-bar-chart';

const meta: Meta = {
  title: 'Charts/BarChart',
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

function createChart(config: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    const chart = new BarChart({
      container,
      data: config.data ?? sampleData,
      title: config.title ?? 'Monatliche Werte',
      animated: config.animated ?? true,
      showValueLabels: config.showValueLabels ?? false,
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
    const chart = new StackedBarChart({
      container,
      data: config.data ?? stackedData,
      series: config.series ?? stackedSeries,
      title: 'Traffic-Quellen',
      animated: true,
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
  render: () => createChart({ xAxisLabel: 'Monat', yAxisLabel: 'Wert' }),
  name: 'With Axis Labels',
};

export const WithAnnotations: StoryObj = {
  render: () => createChart({
    annotations: [
      { axis: 'y', value: 60, label: 'Zielwert' },
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
  render: () => createStackedChart({ xAxisLabel: 'Monat', yAxisLabel: 'Besucher' }),
  name: 'Stacked – With Axis Labels',
};

export const StackedWithAnnotations: StoryObj = {
  render: () => createStackedChart({
    annotations: [
      { axis: 'y', value: 50, label: 'Schwellenwert' },
    ],
  }),
  name: 'Stacked – With Annotations',
};

export const StackedEmptyState: StoryObj = {
  render: () => createStackedChart({ data: [] }),
  name: 'Stacked – Empty State',
};
