import * as d3 from 'd3';
import type { KernTokens } from '../tokens/kern-tokens';

export type ColorScheme = 'categorical' | 'sequential' | 'diverging';

export function buildColorScale(
  domain: string[],
  tokens: KernTokens,
  colorScheme: ColorScheme = 'categorical'
): d3.ScaleOrdinal<string, string> {
  const palette =
    colorScheme === 'sequential' ? tokens.sequentialColors :
    colorScheme === 'diverging'  ? tokens.divergingColors :
    tokens.chartColors;
  const colors = pickEvenly(palette, domain.length);
  return d3.scaleOrdinal<string>().domain(domain).range(colors);
}

function pickEvenly(arr: string[], n: number): string[] {
  if (n <= 0) return [];
  if (n >= arr.length) return Array.from({ length: n }, (_, i) => arr[i % arr.length]);
  if (n === 1) return [arr[0]];
  return Array.from({ length: n }, (_, i) => arr[Math.round(i * (arr.length - 1) / (n - 1))]);
}

export function createLinearScale(
  domain: [number, number],
  range: [number, number]
): d3.ScaleLinear<number, number> {
  return d3.scaleLinear().domain(domain).range(range).nice();
}

export function createBandScale(
  domain: string[],
  range: [number, number],
  padding = 0.2
): d3.ScaleBand<string> {
  return d3.scaleBand().domain(domain).range(range).padding(padding);
}

export function createPointScale(
  domain: string[],
  range: [number, number],
  padding = 0
): d3.ScalePoint<string> {
  return d3.scalePoint().domain(domain).range(range).padding(padding);
}

export function createOrdinalColorScale(
  domain: string[],
  colors: string[]
): d3.ScaleOrdinal<string, string> {
  return d3.scaleOrdinal<string>().domain(domain).range(colors);
}
