import type { Meta, StoryObj } from '@storybook/html';
import { AreaChart } from '../../src/charts/area/area-chart';
import { StackedAreaChart } from '../../src/charts/stacked-area/stacked-area-chart';

const meta: Meta = {
  title: 'Charts/AreaChart',
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
];

const stackedSeries = ['Desktop', 'Mobile', 'Tablet'];
const stackedData = [
  { label: 'Jan', Desktop: 40, Mobile: 25, Tablet: 10 },
  { label: 'Feb', Desktop: 45, Mobile: 30, Tablet: 12 },
  { label: 'Mär', Desktop: 38, Mobile: 35, Tablet: 11 },
  { label: 'Apr', Desktop: 50, Mobile: 40, Tablet: 15 },
  { label: 'Mai', Desktop: 55, Mobile: 42, Tablet: 14 },
];

function createChart(config: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    const chart = new AreaChart({
      container,
      series: config.series ?? sampleSeries,
      title: 'Einnahmenverlauf',
      animated: true,
      xAxisLabel: config.xAxisLabel,
      yAxisLabel: config.yAxisLabel,
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
    const chart = new StackedAreaChart({
      container,
      data: config.data ?? stackedData,
      series: config.series ?? stackedSeries,
      title: 'Gerätenutzung über Zeit',
      xAxisLabel: config.xAxisLabel,
      yAxisLabel: config.yAxisLabel,
    });
    chart.render();
  });

  return container;
}

export const Default: StoryObj = {
  render: () => createChart({}),
  name: 'Default',
};

export const WithAxisLabels: StoryObj = {
  render: () => createChart({ xAxisLabel: 'Monat', yAxisLabel: 'Einnahmen (€)' }),
  name: 'With Axis Labels',
};

export const Stacked: StoryObj = {
  render: () => createStackedChart({}),
  name: 'Stacked',
};

export const StackedWithAxisLabels: StoryObj = {
  render: () => createStackedChart({ xAxisLabel: 'Monat', yAxisLabel: 'Sitzungen' }),
  name: 'Stacked – With Axis Labels',
};
