import type { Meta, StoryObj } from '@storybook/html';
import { ScatterChart } from '../../src/charts/scatter/scatter-chart';

const meta: Meta = {
  title: 'Charts/ScatterChart',
};

export default meta;

const sampleData = Array.from({ length: 30 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  group: i % 2 === 0 ? 'Gruppe A' : 'Gruppe B',
}));

function createChart(config: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    const chart = new ScatterChart({
      container,
      data: config.data ?? sampleData,
      groups: ['Gruppe A', 'Gruppe B'],
      title: 'Streudiagramm',
      xAxisLabel: config.xAxisLabel ?? 'X-Achse',
      yAxisLabel: config.yAxisLabel ?? 'Y-Achse',
      gridlines: config.gridlines,
    });
    chart.render();
  });

  return container;
}

export const Default: StoryObj = {
  render: () => createChart({}),
  name: 'Default',
};
