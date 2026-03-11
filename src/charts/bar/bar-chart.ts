import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createBandScale, createLinearScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesY } from '../../utils/axes';
import { CHART_CONSTANTS } from '../../constants';

export interface Datum {
  label: string;
  value: number;
}

export interface BarChartConfig extends BaseChartConfig {
  data: Datum[];
  showValueLabels?: boolean;
}

export class BarChart extends BaseChart<BarChartConfig> {
  render(): void {
    this.tokens = this.getTokens();
    const g = this.setupSvg();
    const { data } = this.config;
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

    const xScale = createBandScale(
      data.map((d) => d.label),
      [0, innerWidth]
    );
    const yScale = createLinearScale(
      [0, d3.max(data, (d) => d.value) ?? 0],
      [innerHeight, 0]
    );

    // Gridlines (before data layer)
    if (this.config.gridlines?.y !== false) {
      renderGridlinesY(g, yScale, innerWidth, this.tokens);
    }

    // Bars
    const bars = g.selectAll<SVGRectElement, Datum>('rect').data(data);

    const enterBars = bars
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.label) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('fill', this.tokens.chartColors[0])
      .attr('rx', parseFloat(this.tokens.borderRadiusSmall));

    if (this.config.animated) {
      enterBars
        .attr('y', innerHeight)
        .attr('height', 0)
        .transition()
        .duration(CHART_CONSTANTS.animationDuration)
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => innerHeight - yScale(d.value));
    } else {
      enterBars
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => innerHeight - yScale(d.value));
    }

    // Value labels
    if (this.config.showValueLabels) {
      g.selectAll<SVGTextElement, Datum>('text.value-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', (d) => (xScale(d.label) ?? 0) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d.value) - parseFloat(this.tokens.spaceXSmall))
        .attr('text-anchor', 'middle')
        .attr('fill', this.tokens.colorTextMuted)
        .attr('font-family', this.tokens.fontFamily)
        .attr('font-size', this.tokens.fontSizeSmall || '12px')
        .text((d) => d.value.toString());
    }

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);
  }
}
