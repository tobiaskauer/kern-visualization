import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createLinearScale, createPointScale, createOrdinalColorScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesY, renderGridlinesX } from '../../utils/axes';
import { CHART_CONSTANTS } from '../../constants';
import type { StackedDatum } from '../stacked-bar/stacked-bar-chart';
import { ChartTooltip } from '../../utils/tooltip';
import { renderLegend } from '../../utils/legend';

export interface StackedAreaChartConfig extends BaseChartConfig {
  data: StackedDatum[];
  series: string[];
}

export class StackedAreaChart extends BaseChart<StackedAreaChartConfig> {
  private tooltip?: ChartTooltip;

  render(): void {
    if (this.tooltip) {
      this.tooltip.destroy();
    }
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

    // Annotations
    this.renderAnnotations(g, yScale, xScale, innerWidth, innerHeight, this.tokens);

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

    // Tooltip
    this.tooltip = new ChartTooltip(this.config.container);
    const tooltip = this.tooltip;
    const tokens = this.tokens;

    // Mousemove overlay
    const margin = this.config.margin ?? { top: 20, right: 20, bottom: 40, left: 50 };
    const svgNode = this.svg.node();

    g.append('rect')
      .attr('class', 'tooltip-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .on('mousemove', (event: MouseEvent) => {
        if (!svgNode) return;
        const svgRect = svgNode.getBoundingClientRect();
        const mouseX = event.clientX - svgRect.left - margin.left;

        let nearestLabel = allLabels[0];
        let minDist = Infinity;
        for (const label of allLabels) {
          const lx = xScale(label) ?? 0;
          const dist = Math.abs(lx - mouseX);
          if (dist < minDist) {
            minDist = dist;
            nearestLabel = label;
          }
        }

        const rowDatum = data.find((d) => d.label === nearestLabel);
        const rows = series.map((s) => ({
          label: s,
          value: rowDatum ? String(rowDatum[s] ?? 0) : '—',
          color: colorScale(s),
        }));

        const containerRect = this.config.container.getBoundingClientRect();
        const px = event.clientX - containerRect.left;
        const py = event.clientY - containerRect.top;

        tooltip.show(nearestLabel, rows, px, py, tokens);
      })
      .on('mouseleave', () => {
        tooltip.hide();
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);

    // Legend
    if (this.config.legend !== false) {
      const legendItems = series.map((s) => ({ name: s, color: colorScale(s) }));
      renderLegend(this.config.container, legendItems, this.tokens);
    }
  }
}
