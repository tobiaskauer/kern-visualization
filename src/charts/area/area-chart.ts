import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createLinearScale, createBandScale, createOrdinalColorScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis } from '../../utils/axes';
import type { Datum } from '../bar/bar-chart';
import type { LineSeries } from '../line/line-chart';

export interface AreaChartConfig extends BaseChartConfig {
  series: LineSeries[];
}

export class AreaChart extends BaseChart<AreaChartConfig> {
  render(): void {
    this.tokens = this.getTokens();
    const g = this.setupSvg();
    const { series } = this.config;
    const innerWidth = this.getInnerWidth();
    const innerHeight = this.getInnerHeight();

    if (!series || series.length === 0) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', this.tokens.colorTextMuted)
        .attr('font-family', this.tokens.fontFamily)
        .text('No data');
      return;
    }

    const allLabels = series[0].data.map((d) => d.label);
    const xScale = createBandScale(allLabels, [0, innerWidth], 0);
    const xPoint = (label: string) =>
      (xScale(label) ?? 0) + xScale.bandwidth() / 2;

    const allValues = series.flatMap((s) => s.data.map((d) => d.value));
    const yScale = createLinearScale([0, d3.max(allValues) ?? 0], [innerHeight, 0]);

    const colorScale = createOrdinalColorScale(
      series.map((s) => s.name),
      this.tokens.chartColors
    );

    const areaGen = d3
      .area<Datum>()
      .x((d) => xPoint(d.label))
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const lineGen = d3
      .line<Datum>()
      .x((d) => xPoint(d.label))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    series.forEach((s) => {
      const color = colorScale(s.name);

      g.append('path')
        .datum(s.data)
        .attr('fill', color)
        .attr('fill-opacity', 0.15)
        .attr('d', areaGen);

      g.append('path')
        .datum(s.data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', lineGen);
    });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );
  }
}
