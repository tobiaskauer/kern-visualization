import type { Meta, StoryObj } from '@storybook/html';
import { LineChart } from '../../src/charts/line/line-chart';

const meta: Meta = {
  title: 'Charts/LineChart',
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

function createChart(config: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    const chart = new LineChart({
      container,
      series: config.series ?? sampleSeries,
      title: 'Quartalsvergleich',
      animated: true,
      xAxisLabel: config.xAxisLabel,
      yAxisLabel: config.yAxisLabel,
      gridlines: config.gridlines,
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

export const SingleSeries: StoryObj = {
  render: () => createChart({ series: [sampleSeries[0]] }),
  name: 'Single Series',
};

export const WithAxisLabels: StoryObj = {
  render: () => createChart({ xAxisLabel: 'Quartal', yAxisLabel: 'Umsatz' }),
  name: 'With Axis Labels',
};

export const WithAnnotations: StoryObj = {
  render: () => createChart({
    annotations: [
      { axis: 'y', value: 65, label: 'Zielwert' },
    ],
  }),
  name: 'With Annotations',
};
