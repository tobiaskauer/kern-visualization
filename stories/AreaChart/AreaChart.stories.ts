import type { Meta, StoryObj } from '@storybook/html';
import { AreaChart } from '../../src/charts/area/area-chart';

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
    });
    chart.render();
  });

  return container;
}

export const Default: StoryObj = {
  render: () => createChart({}),
  name: 'Default',
};
