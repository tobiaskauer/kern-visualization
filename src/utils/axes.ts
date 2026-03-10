import * as d3 from 'd3';
import type { KernTokens } from '../tokens/kern-tokens';

export interface AxisOptions {
  tokens: KernTokens;
  tickCount?: number;
  tickFormat?: (d: d3.NumberValue) => string;
}

export function renderBottomAxis(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  scale: d3.AxisScale<d3.AxisDomain>,
  options: AxisOptions
): void {
  const axis = d3.axisBottom(scale);
  if (options.tickCount) axis.ticks(options.tickCount);
  if (options.tickFormat) axis.tickFormat(options.tickFormat as (d: d3.NumberValue) => string);

  g.call(axis);
  styleAxis(g, options.tokens);
}

export function renderLeftAxis(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  scale: d3.AxisScale<d3.AxisDomain>,
  options: AxisOptions
): void {
  const axis = d3.axisLeft(scale);
  if (options.tickCount) axis.ticks(options.tickCount);
  if (options.tickFormat) axis.tickFormat(options.tickFormat as (d: d3.NumberValue) => string);

  g.call(axis);
  styleAxis(g, options.tokens);
}

function styleAxis(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  tokens: KernTokens
): void {
  g.select('.domain').attr('stroke', tokens.colorBorder);
  g.selectAll('.tick line').attr('stroke', tokens.colorBorder);
  g.selectAll('.tick text')
    .attr('fill', tokens.colorTextMuted)
    .attr('font-family', tokens.fontFamily)
    .attr('font-size', tokens.fontSizeSmall || '12px');
}
