import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createBandScale, createLinearScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesY } from '../../utils/axes';
import { CHART_CONSTANTS } from '../../constants';
import { ChartTooltip } from '../../utils/tooltip';

export interface Datum {
  label: string;
  value: number;
}

export interface BarChartConfig extends BaseChartConfig {
  data: Datum[];
  showValueLabels?: boolean;
}

export class BarChart extends BaseChart<BarChartConfig> {
  private tooltip?: ChartTooltip;

  render(): void {
    // Destroy previous tooltip if re-rendering
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

    // Annotations (after gridlines, before data)
    this.renderAnnotations(g, yScale, null, innerWidth, innerHeight, this.tokens);

    // Tooltip
    this.tooltip = new ChartTooltip(this.config.container);
    const tooltip = this.tooltip;
    const tokens = this.tokens;

    // Bars
    const bars = g.selectAll<SVGRectElement, Datum>('rect').data(data);

    const enterBars = bars
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.label) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('fill', this.tokens.chartColors[0])
      .attr('rx', parseFloat(this.tokens.borderRadiusSmall))
      .attr('tabindex', '0')
      .attr('aria-label', (d) => `${d.label}: ${d.value}`)
      .style('cursor', 'pointer')
      .style('outline', 'none');

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

    // Hover / focus handlers
    const allBars = g.selectAll<SVGRectElement, Datum>('rect');

    allBars
      .on('mouseover focus', function (event: MouseEvent | FocusEvent, d) {
        // Dim other bars
        allBars.style('opacity', (other) => (other === d ? 1 : 0.4));

        // Get mouse position relative to container
        const containerRect = (this.ownerSVGElement?.parentElement as HTMLElement)?.getBoundingClientRect();
        let px = 0;
        let py = 0;
        if (event instanceof MouseEvent && containerRect) {
          px = event.clientX - containerRect.left;
          py = event.clientY - containerRect.top;
        } else if (event instanceof FocusEvent) {
          const rect = this.getBoundingClientRect();
          if (containerRect) {
            px = rect.left - containerRect.left + rect.width / 2;
            py = rect.top - containerRect.top;
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
