import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createLinearScale, createOrdinalColorScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesY, renderGridlinesX } from '../../utils/axes';
import { CHART_CONSTANTS } from '../../constants';
import { ChartTooltip } from '../../utils/tooltip';
import { renderLegend } from '../../utils/legend';

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
  private tooltip?: ChartTooltip;

  render(): void {
    if (this.tooltip) {
      this.tooltip.destroy();
    }
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

    // Annotations
    this.renderAnnotations(g, yScale, xScale, innerWidth, innerHeight, this.tokens);

    // Tooltip
    this.tooltip = new ChartTooltip(this.config.container);
    const tooltip = this.tooltip;
    const tokens = this.tokens;

    const circles = g.selectAll<SVGCircleElement, ScatterDatum>('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', CHART_CONSTANTS.dotRadius)
      .attr('fill', (d) => colorScale(d.group ?? 'default'))
      .attr('fill-opacity', CHART_CONSTANTS.scatterOpacity)
      .attr('tabindex', '0')
      .attr('aria-label', (d) => `${d.group ?? 'default'}: (${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .style('outline', 'none');

    circles
      .on('mouseover focus', function (this: SVGCircleElement, event: MouseEvent | FocusEvent, d) {
        // Highlight this dot, dim others
        circles
          .attr('fill-opacity', (other) => (other === d ? 1.0 : 0.3));

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

        const groupName = d.group ?? 'default';
        tooltip.show(
          groupName,
          [
            { label: 'x', value: String(d.x) },
            { label: 'y', value: String(d.y) },
          ],
          px,
          py,
          tokens
        );
      })
      .on('mouseout blur', function () {
        circles.attr('fill-opacity', CHART_CONSTANTS.scatterOpacity);
        tooltip.hide();
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);

    // Legend (show if groups are present)
    if (this.config.legend !== false && allGroups.length > 1) {
      const legendItems = allGroups.map((grp) => ({ name: grp, color: colorScale(grp) }));
      renderLegend(this.config.container, legendItems, this.tokens);
    }
  }
}
