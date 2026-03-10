import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createLinearScale, createBandScale, createOrdinalColorScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis } from '../../utils/axes';
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
    const xScale = createBandScale(allLabels, [0, innerWidth], 0);
    const xPoint = (label: string) =>
      (xScale(label) ?? 0) + xScale.bandwidth() / 2;
    const yScale = createLinearScale([0, maxVal], [innerHeight, 0]);

    const areaGen = d3
      .area<d3.SeriesPoint<StackedDatum>>()
      .x((d) => xPoint((d.data as StackedDatum).label))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    stackedData.forEach((layer) => {
      g.append('path')
        .datum(layer)
        .attr('fill', colorScale(layer.key))
        .attr('fill-opacity', 0.8)
        .attr('d', areaGen as any);
    });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );
  }
}
