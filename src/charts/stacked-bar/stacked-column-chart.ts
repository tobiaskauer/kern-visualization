import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createBandScale, createLinearScale, createOrdinalColorScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesX } from '../../utils/axes';
import type { StackedDatum } from './stacked-bar-chart';

export interface StackedColumnChartConfig extends BaseChartConfig {
  data: StackedDatum[];
  series: string[];
}

export class StackedColumnChart extends BaseChart<StackedColumnChartConfig> {
  render(): void {
    this.tokens = this.getTokens();
    const g = this.setupSvg();
    const { data, series } = this.config;
    const innerWidth = this.getInnerWidth();
    const innerHeight = this.getInnerHeight();

    if (!data || data.length === 0) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', this.tokens.colorTextMuted)
        .attr('font-family', this.tokens.fontFamily)
        .text('No data');
      return;
    }

    const colorScale = createOrdinalColorScale(series, this.tokens.chartColors);
    const stackedData = d3.stack<StackedDatum>().keys(series)(data);

    const maxVal = d3.max(stackedData[stackedData.length - 1], (d) => d[1]) ?? 0;

    const yScale = createBandScale(
      data.map((d) => d.label),
      [0, innerHeight]
    );
    const xScale = createLinearScale([0, maxVal], [0, innerWidth]);

    // Gridlines (before data layer)
    if (this.config.gridlines?.x !== false) {
      renderGridlinesX(g, xScale, innerHeight, this.tokens);
    }

    const layer = g.selectAll('g.layer')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', (d) => colorScale(d.key));

    layer.selectAll<SVGRectElement, d3.SeriesPoint<StackedDatum>>('rect')
      .data((d) => d)
      .enter()
      .append('rect')
      .attr('y', (d) => yScale((d.data as StackedDatum).label) ?? 0)
      .attr('height', yScale.bandwidth())
      .attr('x', (d) => xScale(d[0]))
      .attr('width', (d) => xScale(d[1]) - xScale(d[0]));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);
  }
}
