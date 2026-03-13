import type { Meta, StoryObj } from '@storybook/html';
import { ScatterChart } from '../../src/charts/scatter/scatter-chart';

const meta: Meta = {
  title: 'Charts/ScatterChart',
  argTypes: {
    xAxisLabel: { control: 'text',    name: 'X Axis Label' },
    yAxisLabel: { control: 'text',    name: 'Y Axis Label' },
    zLabel:     { control: 'text',    name: 'Z Legend Label' },
    caption:    { control: 'text',    name: 'Caption' },
    animated:   { control: 'boolean', name: 'Animated' },
    gridlinesX: { control: 'boolean', name: 'Gridlines X' },
    gridlinesY: { control: 'boolean', name: 'Gridlines Y' },
    legend:     { control: 'boolean', name: 'Legend' },
  },
  args: {
    xAxisLabel: 'Umsatz',
    yAxisLabel: 'Kosten',
    zLabel:     'Marge',
    caption:    '',
    animated:   true,
    gridlinesX: true,
    gridlinesY: true,
    legend:     true,
  },
};

export default meta;

// Seeded pseudo-random so the scatter pattern is stable across re-renders
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);
const sampleData = Array.from({ length: 40 }, () => ({
  x: rand() * 100,
  y: rand() * 100,
  z: (rand() - 0.5) * 100,   // -50 … +50, drives diverging color
}));

function createChart(args: any): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '600px';
  container.style.height = '300px';

  requestAnimationFrame(() => {
    new ScatterChart({
      container,
      data: args.data ?? sampleData,
      title: 'Streudiagramm mit Drittdimension',
      zLabel: args.zLabel || undefined,
      animated: args.animated,
      xAxisLabel: args.xAxisLabel || undefined,
      yAxisLabel: args.yAxisLabel || undefined,
      caption: args.caption || undefined,
      gridlines: { x: args.gridlinesX, y: args.gridlinesY },
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

export const WithAnnotations: StoryObj = {
  render: (args) => createChart(args),
  name: 'With Annotations',
  args: {
    annotations: [
      { axis: 'y', value: 50, label: 'Median Y' },
      { axis: 'x', value: 50, label: 'Median X' },
    ],
  },
};

export const NoLegend: StoryObj = {
  render: (args) => createChart(args),
  name: 'No Legend',
  args: { legend: false },
};

const tooFewData = [
  { x: 20, y: 40, z: 15 },
  { x: 55, y: 70, z: -10 },
  { x: 80, y: 30, z: 5 },
  { x: 40, y: 60, z: -20 },
];

export const TooFewPoints: StoryObj = {
  render: (args) => createChart({ ...args, data: tooFewData }),
  name: 'Too Few Points (Don\'t)',
};
