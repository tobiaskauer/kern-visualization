import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createLinearScale, createOrdinalColorScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesY, renderGridlinesX } from '../../utils/axes';
import { CHART_CONSTANTS } from '../../constants';

export interface ScatterDatum {
  x: number;
  y: number;
  group?: string;
}

export interface ScatterChartConfig extends BaseChartConfig {
  data: ScatterDatum[];
  groups?: string[];
}

export class ScatterChart extends BaseChart<ScatterChartConfig> {
  render(): void {
    this.tokens = this.getTokens();
    const g = this.setupSvg();
    const { data, groups } = this.config;
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

    const xScale = createLinearScale(
      [d3.min(data, (d) => d.x) ?? 0, d3.max(data, (d) => d.x) ?? 1],
      [0, innerWidth]
    );
    const yScale = createLinearScale(
      [d3.min(data, (d) => d.y) ?? 0, d3.max(data, (d) => d.y) ?? 1],
      [innerHeight, 0]
    );

    const allGroups = groups ?? [...new Set(data.map((d) => d.group ?? 'default'))];
    const colorScale = createOrdinalColorScale(allGroups, this.tokens.chartColors);

    // Gridlines (before data layer)
    if (this.config.gridlines?.y !== false) {
      renderGridlinesY(g, yScale, innerWidth, this.tokens);
    }
    if (this.config.gridlines?.x !== false) {
      renderGridlinesX(g, xScale, innerHeight, this.tokens);
    }

    g.selectAll<SVGCircleElement, ScatterDatum>('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', CHART_CONSTANTS.dotRadius)
      .attr('fill', (d) => colorScale(d.group ?? 'default'))
      .attr('fill-opacity', CHART_CONSTANTS.scatterOpacity);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);
  }
}
