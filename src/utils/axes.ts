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

export function renderGridlinesY(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  yScale: any,
  innerWidth: number,
  tokens: KernTokens
): void {
  const gridGroup = g.append('g').attr('class', 'gridlines');
  const axis = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat('' as any);
  gridGroup.call(axis);
  gridGroup.select('.domain').remove();
  gridGroup
    .selectAll('.tick line')
    .attr('stroke', tokens.colorBorder)
    .attr('stroke-opacity', 0.5);
  gridGroup.selectAll('.tick text').remove();
}

export function renderGridlinesX(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: any,
  innerHeight: number,
  tokens: KernTokens
): void {
  const gridGroup = g
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(0,${innerHeight})`);
  const axis = d3.axisBottom(xScale).tickSize(-innerHeight).tickFormat('' as any);
  gridGroup.call(axis);
  gridGroup.select('.domain').remove();
  gridGroup
    .selectAll('.tick line')
    .attr('stroke', tokens.colorBorder)
    .attr('stroke-opacity', 0.5);
  gridGroup.selectAll('.tick text').remove();
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
