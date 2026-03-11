import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createLinearScale, createPointScale, createOrdinalColorScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesY, renderGridlinesX } from '../../utils/axes';
import { CHART_CONSTANTS } from '../../constants';
import type { StackedDatum } from '../stacked-bar/stacked-bar-chart';

export interface StackedAreaChartConfig extends BaseChartConfig {
  data: StackedDatum[];
  series: string[];
}

export class StackedAreaChart extends BaseChart<StackedAreaChartConfig> {
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

    const allLabels = data.map((d) => d.label);
    const xScale = createPointScale(allLabels, [0, innerWidth]);
    const yScale = createLinearScale([0, maxVal], [innerHeight, 0]);

    // Gridlines (before data layer)
    if (this.config.gridlines?.y !== false) {
      renderGridlinesY(g, yScale, innerWidth, this.tokens);
    }
    if (this.config.gridlines?.x !== false) {
      renderGridlinesX(g, xScale, innerHeight, this.tokens);
    }

    const areaGen = d3
      .area<d3.SeriesPoint<StackedDatum>>()
      .x((d) => xScale((d.data as StackedDatum).label) ?? 0)
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    stackedData.forEach((layer) => {
      g.append('path')
        .datum(layer)
        .attr('fill', colorScale(layer.key))
        .attr('fill-opacity', CHART_CONSTANTS.stackedAreaOpacity)
        .attr('d', areaGen as any);
    });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);
  }
}
