import * as d3 from 'd3';

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

export function createOrdinalColorScale(
  domain: string[],
  colors: string[]
): d3.ScaleOrdinal<string, string> {
  return d3.scaleOrdinal<string>().domain(domain).range(colors);
}
