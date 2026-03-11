import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createBandScale, createLinearScale, createOrdinalColorScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesY } from '../../utils/axes';

export interface StackedDatum {
  label: string;
  [series: string]: number | string;
}

export interface StackedBarChartConfig extends BaseChartConfig {
  data: StackedDatum[];
  series: string[];
}

export class StackedBarChart extends BaseChart<StackedBarChartConfig> {
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

    const xScale = createBandScale(
      data.map((d) => d.label),
      [0, innerWidth]
    );
    const yScale = createLinearScale([0, maxVal], [innerHeight, 0]);

    // Gridlines (before data layer)
    if (this.config.gridlines?.y !== false) {
      renderGridlinesY(g, yScale, innerWidth, this.tokens);
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
      .attr('x', (d) => xScale((d.data as StackedDatum).label) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => yScale(d[1]))
      .attr('height', (d) => yScale(d[0]) - yScale(d[1]));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);
  }
}
