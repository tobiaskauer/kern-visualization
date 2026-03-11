import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createBandScale, createLinearScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesX } from '../../utils/axes';
import { CHART_CONSTANTS } from '../../constants';
import type { Datum } from './bar-chart';
import { ChartTooltip } from '../../utils/tooltip';

export interface ColumnChartConfig extends BaseChartConfig {
  data: Datum[];
  showValueLabels?: boolean;
}

export class ColumnChart extends BaseChart<ColumnChartConfig> {
  private tooltip?: ChartTooltip;

  render(): void {
    if (this.tooltip) {
      this.tooltip.destroy();
    }
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

    const yScale = createBandScale(
      data.map((d) => d.label),
      [0, innerHeight]
    );
    const xScale = createLinearScale(
      [0, d3.max(data, (d) => d.value) ?? 0],
      [0, innerWidth]
    );

    // Gridlines (before data layer)
    if (this.config.gridlines?.x !== false) {
      renderGridlinesX(g, xScale, innerHeight, this.tokens);
    }

    // Annotations (x-axis annotations for column chart — note axes are swapped)
    this.renderAnnotations(g, null, xScale, innerWidth, innerHeight, this.tokens);

    // Tooltip
    this.tooltip = new ChartTooltip(this.config.container);
    const tooltip = this.tooltip;
    const tokens = this.tokens;

    // Bars
    const bars = g.selectAll<SVGRectElement, Datum>('rect').data(data);

    const enterBars = bars
      .enter()
      .append('rect')
      .attr('y', (d) => yScale(d.label) ?? 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', this.tokens.chartColors[0])
      .attr('rx', parseFloat(this.tokens.borderRadiusSmall))
      .attr('tabindex', '0')
      .attr('aria-label', (d) => `${d.label}: ${d.value}`)
      .style('cursor', 'pointer')
      .style('outline', 'none');

    if (this.config.animated) {
      enterBars
        .attr('x', 0)
        .attr('width', 0)
        .transition()
        .duration(CHART_CONSTANTS.animationDuration)
        .attr('width', (d) => xScale(d.value));
    } else {
      enterBars.attr('x', 0).attr('width', (d) => xScale(d.value));
    }

    // Hover / focus handlers
    const allBars = g.selectAll<SVGRectElement, Datum>('rect');

    allBars
      .on('mouseover focus', function (event: MouseEvent | FocusEvent, d) {
        allBars.style('opacity', (other) => (other === d ? 1 : 0.4));

        const containerRect = (this.ownerSVGElement?.parentElement as HTMLElement)?.getBoundingClientRect();
        let px = 0;
        let py = 0;
        if (event instanceof MouseEvent && containerRect) {
          px = event.clientX - containerRect.left;
          py = event.clientY - containerRect.top;
        } else if (event instanceof FocusEvent) {
          const rect = this.getBoundingClientRect();
          if (containerRect) {
            px = rect.left - containerRect.left + rect.width;
            py = rect.top - containerRect.top + rect.height / 2;
          }
        }

        tooltip.show(
          d.label,
          [{ label: 'Wert', value: d.value.toString(), color: tokens.chartColors[0] }],
          px,
          py,
          tokens
        );
      })
      .on('mouseout blur', function () {
        allBars.style('opacity', 1);
        tooltip.hide();
      });

    // Value labels
    if (this.config.showValueLabels) {
      g.selectAll<SVGTextElement, Datum>('text.value-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', (d) => xScale(d.value) + parseFloat(this.tokens.spaceXSmall))
        .attr('y', (d) => (yScale(d.label) ?? 0) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('fill', this.tokens.colorTextMuted)
        .attr('font-family', this.tokens.fontFamily)
        .attr('font-size', this.tokens.fontSizeSmall || '12px')
        .text((d) => d.value.toString());
    }

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale as any, { tokens: this.tokens }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale as any, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);
  }
}
